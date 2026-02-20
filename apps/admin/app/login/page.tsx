'use client';

import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Form, Input, Button, Card, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/auth/login',
        {
          email: values.email,
          password: values.password,
        },
        { withCredentials: true },
      );

      const access = response.data.access_token;
      if (!access) {
        message.error('Login failed. Invalid response from server.');
        setLoading(false);
        return;
      }
      localStorage.setItem('access_token', access);

      message.success('Login successful!');

      router.push('/admin');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Login failed. Please try again.';
      message.error(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        title={
          <div style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}>
            Magazine Admin Login
          </div>
        }
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      >
        <Form name="login" onFinish={onFinish} autoComplete="off" layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Log In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
