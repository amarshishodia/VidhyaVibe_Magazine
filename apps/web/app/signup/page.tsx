'use client';

import { Card, Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import React from 'react';

const { Option } = Select;

export default function SignupPage() {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
        name: values.name,
        phone: values.phone || undefined,
        guardians: [
          {
            name: values.guardianName,
            phone: values.guardianPhone || undefined,
            relation: values.guardianRelation || undefined,
          },
        ],
      };

      await axios.post('/api/auth/register', payload);
      message.success('Account created successfully! Please login.');
      window.location.href = '/login';
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Signup failed. Please try again.';
      message.error(msg);
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
        background:
          'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-color) 100%)',
        padding: '2rem',
      }}
    >
      <Card
        style={{
          width: '100%',
          maxWidth: '550px',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        }}
        bodyStyle={{ padding: '3rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>
            Join the Fun!
          </h1>
          <p style={{ color: '#888' }}>Create your account to start exploring.</p>
        </div>

        <Form name="signup" onFinish={onFinish} layout="vertical" size="large" scrollToFirstError>
          <Form.Item
            name="name"
            label="Child's Full Name"
            rules={[
              { required: true, message: "Please input the child's name!", whitespace: true },
            ]}
          >
            <Input placeholder="Enter child's full name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 6, message: 'Password must be at least 6 characters!' },
            ]}
            hasFeedback
          >
            <Input.Password placeholder="Create a password" />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="Confirm Password"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm your password" />
          </Form.Item>

          <Form.Item name="phone" label="Phone (optional)">
            <Input placeholder="Enter phone number" />
          </Form.Item>

          <div
            style={{
              background: '#f9f9f9',
              padding: '1rem',
              borderRadius: '12px',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ marginBottom: '1rem', color: '#555' }}>Guardian / Parent Information</h3>

            <Form.Item
              name="guardianName"
              label="Guardian Name"
              rules={[{ required: true, message: 'Please input guardian name!' }]}
            >
              <Input placeholder="Enter guardian's full name" />
            </Form.Item>

            <Form.Item name="guardianPhone" label="Guardian Phone (optional)">
              <Input placeholder="Enter guardian's phone number" />
            </Form.Item>

            <Form.Item name="guardianRelation" label="Relation">
              <Select placeholder="Select relation">
                <Option value="father">Father</Option>
                <Option value="mother">Mother</Option>
                <Option value="guardian">Guardian</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </div>

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
                fontWeight: 600,
              }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>
            Login here
          </Link>
        </div>
      </Card>
    </div>
  );
}
