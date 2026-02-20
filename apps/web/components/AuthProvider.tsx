'use client';

import { useEffect } from 'react';
import { setupAxiosRefresh } from '../lib/authRefresh';

let initialized = false;

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!initialized) {
      setupAxiosRefresh();
      initialized = true;
    }
  }, []);

  return <>{children}</>;
}
