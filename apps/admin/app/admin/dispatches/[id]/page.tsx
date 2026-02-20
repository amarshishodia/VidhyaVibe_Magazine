'use client';
import { Card, Form, Input, Button, DatePicker, Select, message } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function DispatchDetail({ params }: any) {
  const id = params.id;
  const [data, setData] = React.useState<any>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  React.useEffect(() => {
    axios.get(`/api/admin/dispatches/${id}`, { withCredentials: true }).then((r) => {
      setData(r.data);
      form.setFieldsValue({
        status: r.data.status,
        courierTrackingNumber: r.data.courier_tracking_number || r.data.courierTrackingNumber || '',
        packedAt: r.data.packed_at ? null : null,
      });
    });
  }, [id]);

  async function onFinish(values: any) {
    try {
      await axios.put(`/api/admin/dispatches/${id}`, values, { withCredentials: true });
      message.success('Updated');
      router.push('/admin/dispatches');
    } catch (e: any) {
      message.error('Update failed');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title={`Dispatch ${id}`}>
        {data && (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'SCHEDULED', label: 'SCHEDULED' },
                  { value: 'DISPATCHED', label: 'DISPATCHED' },
                  { value: 'DELIVERED', label: 'DELIVERED' },
                  { value: 'FAILED', label: 'FAILED' },
                  { value: 'CANCELLED', label: 'CANCELLED' },
                ]}
              />
            </Form.Item>
            <Form.Item name="courierTrackingNumber" label="Courier Tracking Number">
              <Input />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </main>
  );
}
