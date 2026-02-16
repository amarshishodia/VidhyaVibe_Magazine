'use client';

import React from 'react';
import { Card, Form, Input, Button, message, Select } from 'antd';
import axios from 'axios';
import Link from 'next/link';

const { Option } = Select;

export default function SignupPage() {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // await axios.post('/api/auth/register', values);

      console.log('Signup values:', values);
      message.success('Account created successfully! Please login.');
      // window.location.href = '/login';
    } catch (error) {
      message.error('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, var(--background-color) 0%, var(--secondary-color) 100%)',
      padding: '2rem'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: '500px',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '3rem 2rem' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>Join the Fun!</h1>
          <p style={{ color: '#888' }}>Create your account to start exploring.</p>
        </div>

        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please input your name!', whitespace: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { type: 'email', message: 'The input is not valid E-mail!' },
              { required: true, message: 'Please input your E-mail!' },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
            ]}
            hasFeedback
          >
            <Input.Password />
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
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="age"
            label="Age"
            rules={[{ required: true, message: 'Please select your age!' }]}
          >
            <Select placeholder="Select your age">
              {Array.from({ length: 11 }, (_, i) => i + 8).map(age => (
                <Option key={age} value={age}>{age}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block style={{
              backgroundColor: 'var(--primary-color)',
              borderColor: 'var(--primary-color)',
              height: '45px',
              fontWeight: 600
            }}>
              Register
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--secondary-color)', fontWeight: 600 }}>Login here</Link>
        </div>
      </Card>
    </div>
  );
}
