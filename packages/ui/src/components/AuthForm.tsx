import React from 'react';
import { Form, Input, Button } from 'antd';

type Props = {
  onSubmit: (values: { email: string; password: string }) => Promise<void>;
  submitLabel?: string;
};

export const AuthForm: React.FC<Props> = ({ onSubmit, submitLabel = 'Sign in' }) => {
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish} style={{ maxWidth: 420 }}>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item name="password" label="Password" rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitLabel}
        </Button>
      </Form.Item>
    </Form>
  );
};

