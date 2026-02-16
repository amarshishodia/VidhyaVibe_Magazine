"use client";
import React from "react";
import axios from "axios";
import { Card, Row, Col, Statistic, Button } from "antd";
import Link from "next/link";

export default function DashboardIndex() {
  const [summary, setSummary] = React.useState<any>(null);

  React.useEffect(() => {
    axios.get("/api/admin/dashboard/subscriptions/summary", { withCredentials: true }).then((r) => setSummary(r.data));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Subscriptions" value={summary?.total || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Plans" value={(summary?.byPlan || []).length || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending Payments" value={0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Dispatches Scheduled" value={0} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <Card title="Subscription Tracking">
          <p>
            <Link href="/admin/subscriptions">Open</Link>
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
        <Card title="Payment Verification Queue">
          <p>
            <Link href="/admin/payments">Open</Link>
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

