'use client';
import { Card, Row, Col, Statistic } from 'antd';
import Link from 'next/link';
import React from 'react';
import api from '../../../lib/api';

export default function DashboardIndex() {
  const [summary, setSummary] = React.useState<any>(null);

  React.useEffect(() => {
    api
      .get('/admin/dashboard/summary')
      .then((r) => setSummary(r.data))
      .catch(() => setSummary(null));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ marginBottom: 24 }}>Dashboard Overview</h1>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Users" value={summary?.totalUsers ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Magazines" value={summary?.totalMagazines ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Subscriptions" value={summary?.totalSubscriptions ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Readers" value={summary?.totalReaders ?? 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Revenue (USD)"
              value={(summary?.totalRevenueCents ?? 0) / 100}
              precision={2}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending Proofs" value={summary?.pendingProofs ?? 0} />
          </Card>
        </Col>
      </Row>

      <div
        style={{ marginTop: 24, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}
      >
        <Card title="Subscribers">
          <p>
            <Link href="/admin/subscriptions">View Subscriptions</Link>
          </p>
        </Card>
        <Card title="Readers">
          <p>
            <Link href="/admin/readers">View Readers</Link>
          </p>
        </Card>
        <Card title="Orders & Payments">
          <p>
            <Link href="/admin/orders">View Orders</Link>
          </p>
        </Card>
        <Card title="Magazines">
          <p>
            <Link href="/admin/magazines">Manage Magazines</Link>
          </p>
        </Card>
        <Card title="Reader & School Analytics">
          <p>
            <Link href="/admin/readers/analytics">Open</Link>
          </p>
        </Card>
        <Card title="Dispatch Calendar">
          <p>
            <Link href="/admin/dispatches">Open</Link>
          </p>
        </Card>
        <Card title="Coupon Analytics">
          <p>
            <Link href="/admin/coupons">Open</Link>
          </p>
        </Card>
        <Card title="Revenue Dashboard">
          <p>
            <Link href="/admin/revenue">Open</Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
