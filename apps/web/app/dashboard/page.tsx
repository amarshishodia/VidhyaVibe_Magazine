'use client';

import { Button, Empty, Spin } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import MagazineCard from '../../components/MagazineCard';

interface LibraryItem {
  type: string;
  magazineId: number;
  title: string;
  slug: string;
  coverKey: string | null;
  editionId: number | null;
  volume?: number;
  issueNumber?: number;
  publishedAt?: string;
  accessType: string;
}

export default function DashboardPage() {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get('/api/library', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(res.data?.items || []);
      } catch (err) {
        console.error('Failed to fetch library:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const formatDate = (publishedAt?: string) => {
    if (!publishedAt) return '';
    const d = new Date(publishedAt);
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <main style={{ padding: '4rem 0', minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem',
          }}
        >
          <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>My Library</h1>
          <Link href="/magazines/8-11">
            <Button type="primary" size="large">
              Browse Magazines
            </Button>
          </Link>
        </div>

        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>My Subscriptions & Purchases</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <Spin size="large" />
            </div>
          ) : items.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {items.map((item, index) => (
                <MagazineCard
                  key={`${item.accessType}-${item.magazineId}-${item.editionId || index}`}
                  title={item.title}
                  date={formatDate(item.publishedAt) || (item.volume ? `Vol. ${item.volume}` : '')}
                  description={item.accessType === 'subscription' ? 'Subscribed' : 'Purchased'}
                  image={item.coverKey ? `/api/assets/serve?key=${item.coverKey}` : ''}
                  editionId={item.editionId || undefined}
                />
              ))}
            </div>
          ) : (
            <Empty description="You haven't subscribed to or purchased any magazines yet. Browse and subscribe to get started!" />
          )}
        </section>
      </div>
    </main>
  );
}
