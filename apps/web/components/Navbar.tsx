import Link from 'next/link';
import { Button } from 'antd';

const Navbar = () => {
  return (
    <nav style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '1rem 2rem', 
      backgroundColor: '#fff', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
        <Link href="/">Magazine Kids</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/login">
          <Button type="default">Login</Button>
        </Link>
        <Link href="/signup">
          <Button type="primary" style={{ backgroundColor: 'var(--primary-color)' }}>Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
