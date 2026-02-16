"use client";
import React from "react";
import axios from "axios";
import { Card, Table, Tag } from "antd";

export default function SubscriptionsPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  React.useEffect(() => {
    axios.get("/api/admin/dispatches/list?limit=100", { withCredentials: true }).then((r) => {
      // reuse dispatches as sample data; in real world create a subscriptions summary endpoint
      setRows(r.data || []);
    });
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Subscriptions (sample)">
        <Table rowKey="id" dataSource={rows} columns={[{ title: "ID", dataIndex: "id" }, { title: "Subscription", dataIndex: "subscription_id" }, { title: "Scheduled", dataIndex: "scheduled_at" }, { title: "Status", dataIndex: "status", render: (s:any)=><Tag>{s}</Tag> }]} />
      </Card>
    </main>
  );
}

