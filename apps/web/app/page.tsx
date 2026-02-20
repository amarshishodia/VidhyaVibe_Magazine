'use client';

import axios from 'axios';
import React, { useEffect, useState } from 'react';
import AgeGroupSection from '../components/AgeGroupSection';
import Hero from '../components/Hero';
import MagazineCard from '../components/MagazineCard';

interface Magazine {
  id: number;
  title: string;
  slug: string;
  description?: string;
  category?: string;
  createdAt: string;
  image: string;
}

export default function Page() {
  const [recentMagazines, setRecentMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const response = await axios.get('/api/magazines');
        const magazines = response.data || [];

        // Map coverKey to full URL
        const mapped = magazines.map((m: any) => ({
          ...m,
          image: m.coverKey ? `/api/assets/serve?key=${m.coverKey}` : '',
        }));

        setRecentMagazines(mapped.slice(0, 6));
      } catch (error) {
        console.error('Failed to fetch magazines:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMagazines();
  }, []);

  const displayMagazines = recentMagazines.slice(0, 3);
  const previousMagazines = recentMagazines.slice(3, 6);

  return (
    <main>
      <Hero />

      <section style={{ padding: '4rem 0', backgroundColor: '#fff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
            <h2
              style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--primary-color)' }}
            >
              About Magazine Kids
            </h2>
            <p style={{ fontSize: '1.2rem', lineHeight: '1.8', color: '#555' }}>
              Magazine Kids is a monthly subscription service tailored for curious minds aged 8-18.
              We provide age-appropriate content that is both educational and entertaining. With a
              focus on science, history, nature, and current events, Magazine Kids helps children
              explore the world around them in a fun and engaging way.
            </p>
          </div>
        </div>
      </section>

      <AgeGroupSection />

      <section style={{ padding: '4rem 0', backgroundColor: '#f9f9f9' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            Recent Magazines
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {displayMagazines.map((magazine) => (
                <MagazineCard
                  key={magazine.id}
                  id={magazine.id}
                  title={magazine.title}
                  description={magazine.description || ''}
                  date={new Date(magazine.createdAt).getFullYear().toString()}
                  image={magazine.image}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section style={{ padding: '4rem 0', backgroundColor: '#fff' }}>
        <div className="container">
          <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }}>
            More Magazines
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {previousMagazines.map((magazine) => (
                <MagazineCard
                  key={magazine.id}
                  id={magazine.id}
                  title={magazine.title}
                  description={magazine.description || ''}
                  date={new Date(magazine.createdAt).getFullYear().toString()}
                  image={magazine.image}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
