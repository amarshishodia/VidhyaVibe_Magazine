"use client";
import React from 'react';
import { AuthForm } from '@magazine/ui';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const returnUrl = search.get('returnUrl') || '/admin/magazines';

  async function onSubmit(values: any) {
    const res = await axios.post('/api/auth/login', values, { withCredentials: true });
    const access = res.data?.access_token;
    if (access) {
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      router.push(returnUrl);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h2>Admin Login</h2>
      <AuthForm onSubmit={(v) => onSubmit(v)} submitLabel="Login" />
    </main>
  );
}

