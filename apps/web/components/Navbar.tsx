'use client';

import { Button } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';

const Navbar = () => {
  const [loggedIn, setLoggedIn] = React.useState(false);

  React.useEffect(() => {
    setLoggedIn(!!(typeof window !== 'undefined' && localStorage.getItem('access_token')));
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      // ignore logout API errors
    }
    localStorage.removeItem('access_token');
    setLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}
    >
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
        <Link href="/">Magazine Kids</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <Link href="/magazines/8-11">
          <Button type="default">Browse</Button>
        </Link>
        {loggedIn ? (
          <>
            <Link href="/dashboard">
              <Button type="default">My Library</Button>
            </Link>
            <Link href="/profile">
              <Button type="default">Profile</Button>
            </Link>
            <Button type="default" danger onClick={handleLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button type="default">Login</Button>
            </Link>
            <Link href="/signup">
              <Button type="primary" style={{ backgroundColor: 'var(--primary-color)' }}>
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
