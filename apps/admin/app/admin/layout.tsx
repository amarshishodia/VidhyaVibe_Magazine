'use client';
import { Spin } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    // check auth
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    axios
      .get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => {
        if (!r.data?.isAdmin) {
          router.replace('/admin/login');
        } else {
          setAuthChecked(true);
        }
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [router]);

  if (!authChecked) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Spin size="large" tip="Verifying session…" />
      </div>
    );
  }

  return <>{children}</>;
}
