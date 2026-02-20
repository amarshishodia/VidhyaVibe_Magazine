'use client';

import { UploadOutlined } from '@ant-design/icons';
import { Form, Input, Button, Select, DatePicker, Upload, message } from 'antd';
import Link from 'next/link';
import React from 'react';

const { Option } = Select;
const { TextArea } = Input;

export default function CreateMagazinePage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  const onFinish = (values: any) => {
    setLoading(true);
    console.log('Success:', values);
    setTimeout(() => {
      setLoading(false);
      message.success('Magazine created successfully (Demo)');
      window.location.href = '/admin/magazines';
    }, 1000);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <h1>Create New Magazine</h1>
        <Link href="/admin/magazines">
          <Button>Cancel</Button>
        </Link>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'draft' }}>
        <Form.Item
          name="name"
          label="Magazine Name"
          rules={[{ required: true, message: 'Please enter magazine name' }]}
        >
          <Input placeholder="e.g. Space Explorers" />
        </Form.Item>

        <Form.Item
          name="ageGroup"
          label="Age Group"
          rules={[{ required: true, message: 'Please select age group' }]}
        >
          <Select
            placeholder="Select age group"
            options={[
              { value: '8-11', label: '8-11' },
              { value: '12-14', label: '12-14' },
              { value: '15-16', label: '15-16' },
              { value: '17-18', label: '17-18' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }]}
        >
          <TextArea rows={4} placeholder="Brief description of the magazine content" />
        </Form.Item>

        <Form.Item name="publishDate" label="Publish Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          name="coverImage"
          label="Cover Image"
          valuePropName="fileList"
          getValueFromEvent={(e: any) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e && e.fileList;
          }}
        >
          <Upload name="logo" action="/upload.do" listType="picture">
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
            Create Magazine
          </Button>
          <Button htmlType="button" onClick={() => form.resetFields()}>
            Reset
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
