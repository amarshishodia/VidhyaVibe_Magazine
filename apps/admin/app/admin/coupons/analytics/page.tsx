'use client';
import { Card, Table } from 'antd';
import axios from 'axios';
import React from 'react';

export default function CouponsAnalytics() {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    axios
      .get('/api/admin/dashboard/coupons/analytics', { withCredentials: true })
      .then((r) => setRows(r.data.byCoupon || []));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Coupons Analytics">
        <Table
          dataSource={rows}
          rowKey="id"
          columns={[
            { title: 'Code', dataIndex: 'code' },
            { title: 'Pct', dataIndex: 'discount_pct' },
            { title: 'Cents', dataIndex: 'discount_cents' },
            { title: 'Uses', dataIndex: 'uses' },
          ]}
        />
      </Card>
    </main>
  );
}
