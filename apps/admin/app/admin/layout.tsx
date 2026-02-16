"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

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
        if (!r.data?.isAdmin) router.replace('/admin/login');
      })
      .catch(() => {
        router.replace('/admin/login');
      });
  }, [router]);

  return <>{children}</>;
}

