'use client';
import { UploadOutlined } from '@ant-design/icons';
import { Card, Form, Input, Button, Upload, message } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import api from '../../../../lib/api';

export default function NewMagazine() {
  const router = useRouter();
  const [fileList, setFileList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('slug', values.slug);
      if (values.publisher) formData.append('publisher', values.publisher);
      if (values.description) formData.append('description', values.description);
      if (values.category) formData.append('category', values.category);

      if (fileList.length > 0) {
        formData.append('cover', fileList[0].originFileObj);
      }

      await api.post('/admin/magazines', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Magazine created successfully');
      router.push('/admin/magazines');
    } catch (err: any) {
      console.error(err);
      message.error('Failed to create magazine');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    fileList,
  };

  return (
    <main style={{ padding: 24 }}>
      <Card title="New Magazine">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="publisher" label="Publisher">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="category" label="Category">
            <Input />
          </Form.Item>
          <Form.Item label="Cover Image">
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Select Cover</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
