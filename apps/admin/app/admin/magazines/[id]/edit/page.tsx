'use client';
import { UploadOutlined } from '@ant-design/icons';
import { Card, Form, Input, Button, Upload, message, Skeleton } from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import api from '../../../../../lib/api';

export default function EditMagazine({ params }: any) {
  const id = params.id;
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [fileList, setFileList] = useState<any[]>([]);
  const [magazine, setMagazine] = useState<any>(null);

  useEffect(() => {
    api
      .get(`/admin/magazines/${id}`)
      .then((r) => {
        const data = r.data;
        setMagazine(data);
        form.setFieldsValue({
          title: data.title,
          slug: data.slug,
          publisher: data.publisher,
          description: data.description,
          category: data.category,
        });
        setFetching(false);
      })
      .catch((err) => {
        console.error(err);
        message.error('Failed to load magazine data');
        setFetching(false);
      });
  }, [id, form]);

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

      await api.put(`/admin/magazines/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('Magazine updated successfully');
      router.push('/admin/magazines');
    } catch (err: any) {
      console.error(err);
      message.error('Failed to update magazine');
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

  if (fetching) return <Skeleton active />;

  return (
    <main style={{ padding: 24 }}>
      <Card title="Edit Magazine">
        <Form form={form} layout="vertical" onFinish={onFinish}>
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
            {magazine?.coverKey && (
              <div style={{ marginBottom: 12 }}>
                <span style={{ display: 'block', marginBottom: 8, color: '#666' }}>
                  Current cover:
                </span>
                <img
                  src={`/api/assets/serve?key=${encodeURIComponent(magazine.coverKey)}`}
                  alt="Current cover"
                  style={{
                    width: 120,
                    height: 160,
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #eee',
                  }}
                />
              </div>
            )}
            <span style={{ display: 'block', marginBottom: 8, color: '#666' }}>
              {magazine?.coverKey ? 'Replace with new:' : 'Upload cover:'}
            </span>
            <Upload {...uploadProps} listType="picture" maxCount={1}>
              <Button icon={<UploadOutlined />}>Select New Cover</Button>
            </Upload>
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Save Changes
            </Button>
            <Button onClick={() => router.back()} style={{ marginTop: 12 }} block>
              Cancel
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
