'use client';
import { Card, Table, DatePicker, Button } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import React from 'react';

export default function RevenuePage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [range, setRange] = React.useState<any>([dayjs().subtract(30, 'day'), dayjs()]);

  async function load() {
    const start = range[0].format('YYYY-MM-DD');
    const end = range[1].format('YYYY-MM-DD');
    const res = await axios.get(`/api/admin/dashboard/revenue?start=${start}&end=${end}`, {
      withCredentials: true,
    });
    setRows(res.data || []);
  }

  React.useEffect(() => {
    load();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Revenue">
        <div style={{ marginBottom: 12 }}>
          <DatePicker.RangePicker value={range as any} onChange={(r: any) => setRange(r)} />
          <Button style={{ marginLeft: 8 }} onClick={load}>
            Load
          </Button>
        </div>
        <Table
          dataSource={rows}
          rowKey="date"
          columns={[
            { title: 'Date', dataIndex: 'date' },
            { title: 'Total (cents)', dataIndex: 'total_cents' },
          ]}
        />
      </Card>
    </main>
  );
}
