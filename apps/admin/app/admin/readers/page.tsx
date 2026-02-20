'use client';
import { Card, Table, Spin } from 'antd';
import React from 'react';
import api from '../../../lib/api';

export default function ReadersPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api
      .get('/admin/readers')
      .then((r) => setRows(r.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: 'Name', dataIndex: 'name' },
    { title: 'User Email', dataIndex: 'userEmail' },
    { title: 'Age', dataIndex: 'age', width: 70 },
    { title: 'Class', dataIndex: 'className', width: 100 },
    { title: 'School', dataIndex: 'schoolName' },
    { title: 'City', dataIndex: 'schoolCity', width: 120 },
  ];

  return (
    <main style={{ padding: 24 }}>
      <Card title="Readers">
        {loading ? (
          <Spin />
        ) : (
          <Table rowKey="id" dataSource={rows} columns={columns} pagination={{ pageSize: 20 }} />
        )}
      </Card>
    </main>
  );
}
