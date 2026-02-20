'use client';
import dynamic from 'next/dynamic';

// Load reader with react-pdf only on client - avoids "Promise.withResolvers is not a function" in Node 20 during SSR
const ReaderView = dynamic(() => import('./ReaderView'), {
  ssr: false,
  loading: () => <p style={{ padding: 20 }}>Loading reader…</p>,
});

export default function ReaderPage() {
  return <ReaderView />;
}
