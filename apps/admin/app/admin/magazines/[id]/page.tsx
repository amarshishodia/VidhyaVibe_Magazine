"use client";
import React, { useState } from 'react';
import { Card, Button, Upload, message, Form, Input, Divider } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function MagazineDetail({ params }: any) {
  const id = params.id;
  const [mag, setMag] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  React.useEffect(() => {
    api.get(`/admin/magazines/${id}`).then((r) => setMag(r.data));
  }, [id]);

  const onFinishEdition = async (values: any) => {
    setLoading(true);
    try {
      const fd = new FormData();
      if (values.editionPdf?.[0]?.originFileObj) {
        fd.append('editionPdf', values.editionPdf[0].originFileObj);
      }
      if (values.samplePdf?.[0]?.originFileObj) {
        fd.append('samplePdf', values.samplePdf[0].originFileObj);
      }
      if (values.cover?.[0]?.originFileObj) {
        fd.append('cover', values.cover[0].originFileObj);
      }

      await api.post(`/admin/magazines/${id}/editions`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          const pct = Math.round((evt.loaded / (evt.total || 1)) * 100);
          message.loading({ content: `Uploading... ${pct}%`, key: 'upload' });
        }
      });
      message.success({ content: 'EditionUploaded', key: 'upload' });
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error({ content: 'Upload failed', key: 'upload' });
    } finally {
      setLoading(false);
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  return (
    <main style={{ padding: 24 }}>
      <Card title={mag?.title || 'Magazine'}>
        <p><strong>Slug:</strong> {mag?.slug}</p>
        <p><strong>Publisher:</strong> {mag?.publisher}</p>
        <Divider />
        <h3>Upload New Edition</h3>
        <Form form={form} layout="vertical" onFinish={onFinishEdition}>
          <Form.Item
            name="editionPdf"
            label="Edition PDF"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Please upload edition PDF' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select PDF</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="samplePdf"
            label="Sample PDF (Optional)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Select Sample</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="cover"
            label="Edition Cover (Optional)"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload beforeUpload={() => false} maxCount={1} listType="picture">
              <Button icon={<UploadOutlined />}>Select Cover</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Upload Edition
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}

