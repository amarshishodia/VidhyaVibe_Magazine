'use client';

import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, List, Empty, message } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface Magazine {
  id: number;
  title: string;
  slug: string;
  description?: string;
  coverKey?: string;
  category?: string;
}

interface Edition {
  id: number;
  magazineId: number;
  volume?: number;
  issueNumber?: number;
  publishedAt?: string;
  pages?: number;
  description?: string;
  coverUrl?: string;
}

export default function MagazineDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [magazine, setMagazine] = useState<Magazine | null>(null);
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState<boolean | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const [magRes, editionsRes] = await Promise.all([
          axios.get(`/api/magazines/${id}`),
          axios.get(`/api/magazines/${id}/editions`),
        ]);
        setMagazine(magRes.data);
        setEditions(editionsRes.data || []);
      } catch (err) {
        console.error('Failed to fetch magazine:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token || !magazine) return;
    axios
      .get(`/api/subscriptions/check/${magazine.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((r) => setSubscribed(r.data.subscribed))
      .catch(() => setSubscribed(false));
  }, [magazine]);

  const formatDate = (d?: string) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '';

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>;
  if (!magazine)
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Magazine not found.</div>;

  return (
    <main style={{ padding: '4rem 0', minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
      <div className="container">
        <Link
          href="/magazines/8-11"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: '2rem',
            color: '#666',
          }}
        >
          <ArrowLeftOutlined /> Back to Magazines
        </Link>

        <Card style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <div
              style={{
                width: 200,
                flexShrink: 0,
                borderRadius: 8,
                overflow: 'hidden',
                backgroundColor: '#eee',
              }}
            >
              {magazine.coverKey ? (
                <img
                  src={`/api/assets/serve?key=${magazine.coverKey}`}
                  alt={magazine.title}
                  style={{ width: '100%', height: 280, objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: 280,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                  }}
                >
                  Cover
                </div>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{magazine.title}</h1>
              {magazine.description && (
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>{magazine.description}</p>
              )}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link href={`/subscribe?magazineId=${magazine.id}`}>
                  <Button type="primary" size="large">
                    Subscribe
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Editions</h2>
        {editions.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {editions.map((ed) => (
              <Card key={ed.id} hoverable style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {ed.coverUrl ? (
                    <img
                      src={ed.coverUrl}
                      alt=""
                      style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: 180,
                        backgroundColor: '#eee',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999',
                      }}
                    >
                      No cover
                    </div>
                  )}
                  <h3 style={{ margin: 0 }}>
                    {ed.volume
                      ? `Volume ${ed.volume}${ed.issueNumber ? `, Issue ${ed.issueNumber}` : ''}`
                      : 'Edition'}
                  </h3>
                  <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
                    {formatDate(ed.publishedAt)}
                    {ed.pages ? ` · ${ed.pages} pages` : ''}
                  </p>
                  {ed.description && (
                    <p style={{ fontSize: 13, color: '#555', margin: 0 }}>{ed.description}</p>
                  )}
                  <div style={{ marginTop: 'auto' }}>
                    {subscribed ? (
                      <Link href={`/reader/${ed.id}`}>
                        <Button type="primary" block>
                          Read
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/buy/${ed.id}`}>
                        <Button block>Buy This Edition</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Empty description="No published editions yet." />
        )}
      </div>
    </main>
  );
}
