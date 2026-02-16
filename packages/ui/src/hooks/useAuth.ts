import { useState } from 'react';
import axios from 'axios';

export function useAuth() {
  const [user, setUser] = useState<any>(null);

  async function login(email: string, password: string) {
    const res = await axios.post('/api/auth/login', { email, password }, { withCredentials: true });
    const access = res.data?.access_token;
    if (access) {
      localStorage.setItem('access_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    }
    setUser(res.data?.user || null);
    return res.data;
  }

  async function logout() {
    await axios.post('/api/auth/logout');
    localStorage.removeItem('access_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }

  return { user, login, logout, setUser };
}

