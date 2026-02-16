"use client";
import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Skeleton } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../../../../../lib/api';
import { useRouter } from 'next/navigation';

export default function EditMagazine({ params }: any) {
    const id = params.id;
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fileList, setFileList] = useState<any[]>([]);

    useEffect(() => {
        api.get(`/admin/magazines/${id}`)
            .then((r) => {
                form.setFieldsValue(r.data);
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
                    <Form.Item label="New Cover Image (Optional)">
                        <Upload {...uploadProps} listType="picture" maxCount={1}>
                            <Button icon={<UploadOutlined />}>Select Cover</Button>
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
