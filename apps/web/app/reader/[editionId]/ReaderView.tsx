'use client';
import { Button, Switch } from 'antd';
import axios from 'axios';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function ReaderView() {
  const params = useParams();
  const searchParams = useSearchParams();
  const editionId = params?.editionId;

  // Support token passthrough when admin opens Read link (cross-origin, different localStorage)
  React.useEffect(() => {
    const token = searchParams?.get('token');
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
      window.history.replaceState({}, '', `/reader/${editionId}`);
      window.location.reload();
    }
  }, [editionId, searchParams]);
  const [pages, setPages] = React.useState<any[]>([]);
  const [current, setCurrent] = React.useState(1);
  const [low, setLow] = React.useState(false);
  const [readerId, setReaderId] = React.useState<number | null>(null);
  const [readers, setReaders] = React.useState<any[]>([]);
  const [animClass, setAnimClass] = React.useState<string>('');
  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const [numPdfPages, setNumPdfPages] = React.useState<number>(0);
  const [pageWidth, setPageWidth] = React.useState(800);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = React.useState(false);
  const [pdfLoadError, setPdfLoadError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLoadError(null);
    setDataLoaded(false);
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      const redirect = encodeURIComponent(`/reader/${editionId}`);
      window.location.href = `/login?redirect=${redirect}`;
      return;
    }
    axios
      .get(`/api/editions/${editionId}/pages`, { headers })
      .then((r) => {
        setPages(r.data?.list || []);
        setPdfUrl(r.data?.pdfUrl || null);
        setDataLoaded(true);
        setLoadError(null);
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          const redirect = encodeURIComponent(`/reader/${editionId}`);
          window.location.href = `/login?redirect=${redirect}`;
          return;
        }
        setPages([]);
        setPdfUrl(null);
        setDataLoaded(true);
        const status = err?.response?.status;
        const msg = err?.response?.data?.error || err?.response?.data?.message;
        if (status === 403)
          setLoadError("You don't have access to this edition. Subscribe or purchase to read.");
        else if (status === 404) setLoadError('Edition not found.');
        else setLoadError(msg || 'Failed to load edition. Please try again.');
      });
    // fetch default reader for user (first reader)
    axios
      .get('/api/readers', { headers })
      .then((r) => {
        const rs = r.data || [];
        setReaders(rs);
        if (rs.length) {
          setReaderId(rs[0].id);
        }
      })
      .catch((err) => {
        if (err?.response?.status === 401) {
          const redirect = encodeURIComponent(`/reader/${editionId}`);
          window.location.href = `/login?redirect=${redirect}`;
          return;
        }
      });
  }, [editionId]);

  React.useEffect(() => {
    const w = Math.min(800, window.innerWidth - 80);
    setPageWidth(w);
    const onResize = () => setPageWidth(Math.min(800, window.innerWidth - 80));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // save progress (debounced)
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!readerId) return;
      const total = pdfUrl && token ? numPdfPages : pages.length || 1;
      if (total < 1) return;
      axios.post(
        `/api/reader-progress/${readerId}/progress`,
        {
          editionId: Number(editionId),
          currentPage: current,
          percent: Math.round((current / total) * 100),
        },
        { headers: getAuthHeaders() },
      );
    }, 1000);
    return () => clearTimeout(t);
  }, [current, readerId, editionId, pages.length, pdfUrl, token, numPdfPages]);
  const pageUrl = (p: number) =>
    `/api/editions/${editionId}/pages/${p}?lowBandwidth=${low ? '1' : '0'}${token ? `&token=${encodeURIComponent(token)}` : ''}`;

  // preload adjacent pages for smoother transitions
  React.useEffect(() => {
    if (!pages.length) return;
    const toPreload: number[] = [];
    const next = Math.min(pages.length, current + 1);
    const prev = Math.max(1, current - 1);
    toPreload.push(prev);
    toPreload.push(next);
    const next2 = Math.min(pages.length, current + 2);
    if (next2 !== next) toPreload.push(next2);

    const imgs: HTMLImageElement[] = [];
    toPreload.forEach((p) => {
      const img = new Image();
      img.src = pageUrl(p);
      imgs.push(img);
    });

    return () => {
      imgs.forEach((i) => {
        i.src = '';
      });
    };
  }, [current, pages.length, editionId, low, token]);

  // when reader selected, load progress
  React.useEffect(() => {
    if (!readerId) return;
    axios
      .get(`/api/reader-progress/${readerId}/edition/${editionId}`, { headers: getAuthHeaders() })
      .then((pr) => {
        if (pr.data && pr.data.current_page) setCurrent(pr.data.current_page);
      });
  }, [readerId, editionId]);

  const totalPages = pdfUrl && token ? numPdfPages : pages.length || 1;

  // keyboard navigation
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') {
        flipTo(current - 1, 'left');
      } else if (e.key === 'ArrowRight' || e.key === ' ') {
        flipTo(current + 1, 'right');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [current, totalPages]);
  const prev = () => setCurrent((c) => Math.max(1, c - 1));
  const next = () => setCurrent((c) => Math.min(totalPages, c + 1));

  function flipTo(target: number, direction: 'left' | 'right') {
    if (target < 1 || target > totalPages) return;
    setAnimClass(direction === 'right' ? 'flip-right' : 'flip-left');
    setTimeout(() => {
      setCurrent(target);
      setAnimClass('flip-reset');
      setTimeout(() => setAnimClass(''), 50);
    }, 300);
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <label style={{ marginRight: 8 }}>Reader:</label>
          <select
            value={readerId || ''}
            onChange={(e) => setReaderId(Number(e.target.value))}
            style={{ padding: 6, minWidth: 200 }}
          >
            {readers.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Button onClick={() => flipTo(current - 1, 'left')} disabled={current <= 1}>
            Prev
          </Button>{' '}
          <Button onClick={() => flipTo(current + 1, 'right')} disabled={current >= totalPages}>
            Next
          </Button>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          Low bandwidth mode <Switch checked={low} onChange={(v) => setLow(v)} />
        </div>
      </div>
      <div>
        {pdfUrl && token ? (
          <div>
            <div
              className={`page-container ${animClass}`}
              style={{ perspective: 1000, display: 'flex', justifyContent: 'center' }}
            >
              <Document
                file={{
                  url: `${typeof window !== 'undefined' ? window.location.origin : ''}${pdfUrl}`,
                }}
                options={token ? { httpHeaders: { Authorization: `Bearer ${token}` } } : undefined}
                onLoadSuccess={({ numPages }) => {
                  setNumPdfPages(numPages);
                  setPdfLoadError(null);
                }}
                onLoadError={(e) => setPdfLoadError(e?.message || 'Failed to load PDF')}
                loading={<p>Loading PDF…</p>}
                error={pdfLoadError ? <p>{pdfLoadError}</p> : <p>Failed to load PDF.</p>}
              >
                <Page
                  pageNumber={current}
                  width={pageWidth}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  if (!readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/bookmarks',
                      { readerId, editionId: Number(editionId), pageNumber: current },
                      { headers: getAuthHeaders() },
                    );
                    alert('Bookmarked');
                  } catch (e: any) {
                    alert('Bookmark failed');
                  }
                }}
              >
                Bookmark
              </button>
              <button
                onClick={async () => {
                  const content = prompt('Enter note for page ' + current);
                  if (!content || !readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/notes',
                      { readerId, editionId: Number(editionId), pageNumber: current, content },
                      { headers: getAuthHeaders() },
                    );
                    alert('Note saved');
                  } catch (e: any) {
                    alert('Save note failed');
                  }
                }}
              >
                Add Note
              </button>
              <button
                onClick={async () => {
                  const text = prompt('Highlight text (short)');
                  if (!text || !readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/highlights',
                      {
                        readerId,
                        editionId: Number(editionId),
                        pageNumber: current,
                        text,
                        color: '#ff0',
                      },
                      { headers: getAuthHeaders() },
                    );
                    alert('Highlight saved');
                  } catch (e: any) {
                    alert('Save highlight failed');
                  }
                }}
              >
                Highlight
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.get(
                      `/api/editions/${editionId}/videos?page=${current}`,
                      { headers: getAuthHeaders() },
                    );
                    const vids = res.data || [];
                    if (!vids.length) return alert('No videos for this page');
                    window.open(vids[0].url, '_blank');
                  } catch (e: any) {
                    alert('Failed to fetch videos');
                  }
                }}
              >
                Videos
              </button>
            </div>
          </div>
        ) : pages.length ? (
          <div>
            <div className={`page-container ${animClass}`} style={{ perspective: 1000 }}>
              <img
                key={current}
                src={pageUrl(current)}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  backfaceVisibility: 'hidden',
                }}
                alt={`Page ${current}`}
              />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button
                onClick={async () => {
                  if (!readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/bookmarks',
                      { readerId, editionId: Number(editionId), pageNumber: current },
                      { headers: getAuthHeaders() },
                    );
                    alert('Bookmarked');
                  } catch (e: any) {
                    alert('Bookmark failed');
                  }
                }}
              >
                Bookmark
              </button>
              <button
                onClick={async () => {
                  const content = prompt('Enter note for page ' + current);
                  if (!content || !readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/notes',
                      { readerId, editionId: Number(editionId), pageNumber: current, content },
                      { headers: getAuthHeaders() },
                    );
                    alert('Note saved');
                  } catch (e: any) {
                    alert('Save note failed');
                  }
                }}
              >
                Add Note
              </button>
              <button
                onClick={async () => {
                  const text = prompt('Highlight text (short)');
                  if (!text || !readerId) return;
                  try {
                    await axios.post(
                      '/api/interactions/highlights',
                      {
                        readerId,
                        editionId: Number(editionId),
                        pageNumber: current,
                        text,
                        color: '#ff0',
                      },
                      { headers: getAuthHeaders() },
                    );
                    alert('Highlight saved');
                  } catch (e: any) {
                    alert('Save highlight failed');
                  }
                }}
              >
                Highlight
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.get(
                      `/api/editions/${editionId}/videos?page=${current}`,
                      { headers: getAuthHeaders() },
                    );
                    const vids = res.data || [];
                    if (!vids.length) return alert('No videos for this page');
                    window.open(vids[0].url, '_blank');
                  } catch (e: any) {
                    alert('Failed to fetch videos');
                  }
                }}
              >
                Videos
              </button>
            </div>
          </div>
        ) : loadError ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#666' }}>
            <p style={{ marginBottom: 16 }}>{loadError}</p>
            <Button type="primary" onClick={() => (window.location.href = '/')}>
              Go to Home
            </Button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <p>
        Page {current} / {totalPages}
      </p>
      <style jsx>{`
        .page-container {
          display: inline-block;
          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease;
          transform-origin: center;
        }
        .page-container.flip-right {
          transform: rotateY(-20deg) translateX(10px);
          box-shadow: -8px 8px 24px rgba(0, 0, 0, 0.2);
        }
        .page-container.flip-left {
          transform: rotateY(20deg) translateX(-10px);
          box-shadow: 8px 8px 24px rgba(0, 0, 0, 0.2);
        }
        .page-container.flip-reset {
          transform: none;
        }
      `}</style>
    </main>
  );
}
