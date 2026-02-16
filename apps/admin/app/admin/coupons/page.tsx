"use client";
import React from 'react';
import axios from 'axios';
import { Table, Button, Card } from 'antd';
import Link from 'next/link';

export default function CouponsPage() {
  const [coupons, setCoupons] = React.useState<any[]>([]);
  React.useEffect(() => {
    axios.get('/api/admin/coupons/list').then((r) => setCoupons(r.data || []));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Coupons">
        <p>
          <Link href="/admin/coupons/new">
            <Button type="primary">New Coupon</Button>
          </Link>
        </p>
        <Table rowKey="id" dataSource={coupons} columns={[{ title: 'Code', dataIndex: 'code' }, { title: 'Pct', dataIndex: 'discount_pct' }, { title: 'Cents', dataIndex: 'discount_cents' }, { title: 'Active', dataIndex: 'active' }]} />
      </Card>
    </main>
  );
}

