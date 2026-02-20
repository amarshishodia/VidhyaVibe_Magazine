'use client';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Table, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Link from 'next/link';
import React from 'react';

interface DataType {
  key: string;
  name: string;
  ageGroup: string;
  status: string;
  publishDate: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Age Group',
    dataIndex: 'ageGroup',
    key: 'ageGroup',
    render: (ageGroup) => (
      <Tag color={ageGroup === '8-11' ? 'blue' : ageGroup === '12-14' ? 'geekblue' : 'purple'}>
        {ageGroup}
      </Tag>
    ),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Publish Date',
    dataIndex: 'publishDate',
    key: 'publishDate',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Button icon={<EditOutlined />} type="text" />
        <Button icon={<DeleteOutlined />} type="text" danger />
      </Space>
    ),
  },
];

const data: DataType[] = [
  {
    key: '1',
    name: 'Space Explorers',
    ageGroup: '8-11',
    status: 'Published',
    publishDate: '2023-10-01',
  },
  {
    key: '2',
    name: 'Tech Trends',
    ageGroup: '12-14',
    status: 'Draft',
    publishDate: '-',
  },
  {
    key: '3',
    name: 'Future Careers',
    ageGroup: '15-16',
    status: 'Published',
    publishDate: '2023-09-15',
  },
];

export default function MagazinesPage() {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h1>Magazines</h1>
        <Link href="/admin/magazines/create">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Magazine
          </Button>
        </Link>
      </div>
      <Table columns={columns} dataSource={data} />
    </div>
  );
}
