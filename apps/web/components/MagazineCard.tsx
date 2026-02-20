import { Button, message } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';

interface MagazineCardProps {
  id?: number;
  title: string;
  image: string;
  date: string;
  description: string;
  /** When provided (e.g. from library), Read Now goes directly to reader without subscription check */
  editionId?: number;
}

const MagazineCard = ({ id, title, image, date, description, editionId }: MagazineCardProps) => {
  const [loading, setLoading] = React.useState(false);

  const handleReadNow = async () => {
    const token = localStorage.getItem('access_token');

    if (!token) {
      message.info('Please login to read the magazine');
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return;
    }

    // Library mode: user already has access, go directly to reader
    if (editionId) {
      window.location.href = `/reader/${editionId}`;
      return;
    }

    // Browse mode: check subscription first
    if (!id) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/subscriptions/check/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.subscribed) {
        if (response.data.editionId) {
          window.location.href = `/reader/${response.data.editionId}`;
        } else {
          message.warning('No editions found for this magazine yet.');
        }
      } else {
        message.error('You have not subscribed to this edition or magazine.');
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error('Session expired. Please login again.');
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      } else {
        message.error('Failed to check subscription. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s ease',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          height: '200px',
          backgroundColor: '#eee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
        }}
      >
        {/* Placeholder for image */}
        {image ? (
          <img
            src={image}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          'Cover Image'
        )}
      </div>
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>{date}</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>{title}</h3>
        <p style={{ color: '#666', marginBottom: '1.5rem', flex: 1 }}>{description}</p>
        <div style={{ display: 'flex', gap: 8 }}>
          {id && (
            <Link href={`/magazine/${id}`} style={{ flex: 1 }}>
              <Button block style={{ width: '100%' }}>
                View
              </Button>
            </Link>
          )}
          <Button
            type="primary"
            block
            onClick={handleReadNow}
            loading={loading}
            style={{ flex: id ? 1 : undefined }}
          >
            Read Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MagazineCard;
