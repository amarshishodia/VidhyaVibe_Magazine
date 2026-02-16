"use client";
import React from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { Button, Switch } from "antd";

export default function ReaderPage() {
  const params = useParams();
  const editionId = params?.editionId;
  const [pages, setPages] = React.useState<any[]>([]);
  const [current, setCurrent] = React.useState(1);
  const [low, setLow] = React.useState(false);
  const [readerId, setReaderId] = React.useState<number | null>(null);
  const [readers, setReaders] = React.useState<any[]>([]);
  const [animClass, setAnimClass] = React.useState<string>("");

  React.useEffect(() => {
    axios.get(`/api/editions/${editionId}/pages`).then((r) => {
      setPages(r.data.list || []);
    });
    // fetch default reader for user (first reader)
    axios.get("/api/readers").then((r) => {
      const rs = r.data || [];
      setReaders(rs);
      if (rs.length) {
        setReaderId(rs[0].id);
      }
    });
  }, [editionId]);

  // save progress (debounced)
  React.useEffect(() => {
    const t = setTimeout(() => {
      if (!readerId) return;
      axios.post(`/api/reader-progress/${readerId}/progress`, { editionId: Number(editionId), currentPage: current, percent: Math.round((current / (pages.length || 1)) * 100) });
    }, 1000);
    return () => clearTimeout(t);
  }, [current, readerId, editionId, pages.length]);

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
      img.src = `/api/editions/${editionId}/pages/${p}?lowBandwidth=${low ? "1" : "0"}`;
      imgs.push(img);
    });

    return () => {
      imgs.forEach((i) => {
        i.src = '';
      });
    };
  }, [current, pages.length, editionId, low]);

  // when reader selected, load progress
  React.useEffect(() => {
    if (!readerId) return;
    axios.get(`/api/reader-progress/${readerId}/edition/${editionId}`).then((pr) => {
      if (pr.data && pr.data.current_page) setCurrent(pr.data.current_page);
    });
  }, [readerId, editionId]);

  // keyboard navigation
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        flipTo(current - 1, "left");
      } else if (e.key === "ArrowRight" || e.key === " ") {
        flipTo(current + 1, "right");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, pages.length]);

  const prev = () => setCurrent((c) => Math.max(1, c - 1));
  const next = () => setCurrent((c) => Math.min(pages.length || 1, c + 1));

  function flipTo(target: number, direction: "left" | "right") {
    if (target < 1 || target > (pages.length || 1)) return;
    setAnimClass(direction === "right" ? "flip-right" : "flip-left");
    // allow animation duration then set page
    setTimeout(() => {
      setCurrent(target);
      setAnimClass("flip-reset");
      // reset class after short delay
      setTimeout(() => setAnimClass(""), 50);
    }, 300);
  }

  return (
    <main style={{ padding: 20 }}>
      <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 12 }}>
        <div>
          <label style={{ marginRight: 8 }}>Reader:</label>
          <select
            value={readerId || ""}
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
          <Button onClick={() => flipTo(current - 1, "left")} disabled={current <= 1}>
            Prev
          </Button>{" "}
          <Button onClick={() => flipTo(current + 1, "right")} disabled={current >= (pages.length || 1)}>
            Next
          </Button>
        </div>
        <div style={{ marginLeft: "auto" }}>
          Low bandwidth mode <Switch checked={low} onChange={(v) => setLow(v)} />
        </div>
      </div>
      <div>
        {pages.length ? (
          <div>
            <div className={`page-container ${animClass}`} style={{ perspective: 1000 }}>
              <img
                key={current}
                src={`/api/editions/${editionId}/pages/${current}?lowBandwidth=${low ? "1" : "0"}`}
                style={{ maxWidth: "100%", height: "auto", display: "block", backfaceVisibility: "hidden" }}
                alt={`Page ${current}`}
              />
            </div>
            <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
              <button
                onClick={async () => {
                  if (!readerId) return;
                  try {
                    await axios.post("/api/interactions/bookmarks", { readerId, editionId: Number(editionId), pageNumber: current });
                    alert("Bookmarked");
                  } catch (e: any) {
                    alert("Bookmark failed");
                  }
                }}
              >
                Bookmark
              </button>
              <button
                onClick={async () => {
                  // open note prompt
                  const content = prompt("Enter note for page " + current);
                  if (!content || !readerId) return;
                  try {
                    await axios.post("/api/interactions/notes", { readerId, editionId: Number(editionId), pageNumber: current, content });
                    alert("Note saved");
                  } catch (e: any) {
                    alert("Save note failed");
                  }
                }}
              >
                Add Note
              </button>
              <button
                onClick={async () => {
                  const text = prompt("Highlight text (short)");
                  if (!text || !readerId) return;
                  try {
                    await axios.post("/api/interactions/highlights", { readerId, editionId: Number(editionId), pageNumber: current, text, color: "#ff0" });
                    alert("Highlight saved");
                  } catch (e: any) {
                    alert("Save highlight failed");
                  }
                }}
              >
                Highlight
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await axios.get(`/api/editions/${editionId}/videos?page=${current}`);
                    const vids = res.data || [];
                    if (!vids.length) return alert("No videos for this page");
                    const url = vids[0].url;
                    // open simple popup
                    window.open(url, "_blank");
                  } catch (e: any) {
                    alert("Failed to fetch videos");
                  }
                }}
              >
                Videos
              </button>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <p>
        Page {current} / {pages.length}
      </p>
      <style jsx>{`
        .page-container {
          display: inline-block;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
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

