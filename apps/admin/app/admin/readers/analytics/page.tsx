"use client";
import React from "react";
import axios from "axios";
import { Card, Table } from "antd";

export default function ReadersAnalytics() {
  const [data, setData] = React.useState<any>(null);
  React.useEffect(() => {
    axios.get("/api/admin/dashboard/readers/analytics", { withCredentials: true }).then((r) => setData(r.data));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Readers Analytics">
        <h3>Top Cities</h3>
        <Table dataSource={data?.byCity || []} rowKey="school_city" pagination={false} columns={[{ title: "City", dataIndex: "school_city" }, { title: "Count", dataIndex: "cnt" }]} />
        <h3 style={{ marginTop: 16 }}>Top Schools</h3>
        <Table dataSource={data?.bySchool || []} rowKey="school_name" pagination={false} columns={[{ title: "School", dataIndex: "school_name" }, { title: "Count", dataIndex: "cnt" }]} />
      </Card>
    </main>
  );
}

