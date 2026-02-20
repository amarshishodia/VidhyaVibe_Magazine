'use client';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Card, Form, Input, Button, message } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For now, mirroring the demo logic but adding token storage
      const res = await axios.post('/api/auth/login', values);

      if (res.data.access_token) {
        localStorage.setItem('access_token', res.data.access_token);
        message.success('Logged in successfully');

        if (redirect) {
          window.location.href = redirect;
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        message.error('Login failed. Invalid response from server.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, var(--background-color) 0%, var(--accent-color) 100%)',
        padding: '2rem',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '450px',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
        bodyStyle={{ padding: '3rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Welcome Back!
          </h1>
          <p style={{ color: '#888' }}>Login to continue reading your favorite magazines.</p>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item name="email" rules={[{ required: true, message: 'Please input your Email!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{
                backgroundColor: 'var(--primary-color)',
                borderColor: 'var(--primary-color)',
                height: '45px',
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              Log In
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Don't have an account?{' '}
          <Link href="/signup" style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>
            Sign up now
          </Link>
        </div>
      </Card>
    </div>
  );
}
