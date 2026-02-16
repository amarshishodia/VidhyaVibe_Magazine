"use client";
import React from "react";
import axios from "axios";
import { Table, Button, Card, Tag } from "antd";
import Link from "next/link";

export default function DispatchesPage() {
  const [rows, setRows] = React.useState<any[]>([]);

  React.useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await axios.get("/api/admin/dispatches/list?limit=200", { withCredentials: true });
    setRows(res.data || []);
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title="Dispatch Schedules">
        <p>
          <Button onClick={() => axios.post("/api/admin/dispatches/assign", {}, { withCredentials: true }).then(load)}>Assign Editions</Button>
        </p>
        <Table
          rowKey="id"
          dataSource={rows}
          columns={[
            { title: "ID", dataIndex: "id" },
            { title: "Subscription", dataIndex: "subscription_id" },
            { title: "Magazine", dataIndex: "magazine_id" },
            { title: "Scheduled At", dataIndex: "scheduled_at" },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: any) => <Tag color={s === "SCHEDULED" ? "blue" : s === "DISPATCHED" ? "orange" : s === "DELIVERED" ? "green" : "default"}>{s}</Tag>
            },
            {
              title: "Edition",
              dataIndex: "edition_id",
              render: (e: any) => (e ? <Link href={`/admin/magazines/${e}`}>{e}</Link> : "TBD")
            },
            {
              title: "Actions",
              render: (_: any, record: any) => (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/admin/dispatches/${record.id}`}>
                    <Button size="small">Open</Button>
                  </Link>
                </div>
              )
            }
          ]}
        />
      </Card>
    </main>
  );
}

