'use client';
import { Card, Table, Tag, Button, Spin, message } from 'antd';
import React from 'react';
import api from '../../../lib/api';

export default function OrdersPage() {
  const [data, setData] = React.useState<{ subscriptionOrders: any[]; editionOrders: any[] }>({
    subscriptionOrders: [],
    editionOrders: [],
  });
  const [subscriptionProofs, setSubscriptionProofs] = React.useState<any[]>([]);
  const [editionProofs, setEditionProofs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api
        .get('/admin/payments/orders')
        .then((r) => setData(r.data || { subscriptionOrders: [], editionOrders: [] })),
      api.get('/admin/payments/proofs/pending').then((r) => setSubscriptionProofs(r.data || [])),
      api.get('/admin/payments/edition-proofs/pending').then((r) => setEditionProofs(r.data || [])),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    load();
  }, []);

  const verifySubscriptionProof = (id: number) => {
    api
      .post(`/admin/payments/proofs/${id}/verify`)
      .then(() => {
        message.success('Subscription order verified');
        load();
      })
      .catch((e: any) => message.error(e.response?.data?.message || 'Verify failed'));
  };

  const verifyEditionProof = (id: number) => {
    api
      .post(`/admin/payments/edition-proofs/${id}/verify`)
      .then(() => {
        message.success('Edition order verified');
        load();
      })
      .catch((e: any) => message.error(e.response?.data?.message || 'Verify failed'));
  };

  if (loading)
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );

  return (
    <main style={{ padding: 24 }}>
      <Card title="Payment Proofs Pending Verification" style={{ marginBottom: 24 }}>
        <h4>Subscription Proofs</h4>
        {subscriptionProofs.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={subscriptionProofs}
            size="small"
            columns={[
              { title: 'Proof ID', dataIndex: 'id', width: 80 },
              { title: 'Order ID', dataIndex: 'order_id', width: 80 },
              {
                title: 'Amount',
                dataIndex: 'final_cents',
                render: (c: number) => (c ? `${(c / 100).toFixed(2)}` : '-'),
              },
              {
                title: 'Created',
                dataIndex: 'created_at',
                render: (d: any) => (d ? new Date(d).toLocaleString() : '-'),
              },
              {
                title: 'Action',
                render: (_: any, r: any) => (
                  <Button type="primary" size="small" onClick={() => verifySubscriptionProof(r.id)}>
                    Verify
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <p style={{ color: '#888' }}>No pending subscription proofs.</p>
        )}
        <h4 style={{ marginTop: 24 }}>Edition Purchase Proofs</h4>
        {editionProofs.length > 0 ? (
          <Table
            rowKey="id"
            dataSource={editionProofs}
            size="small"
            columns={[
              { title: 'Proof ID', dataIndex: 'id', width: 80 },
              { title: 'Order ID', dataIndex: 'order_id', width: 80 },
              { title: 'Edition ID', dataIndex: 'edition_id', width: 80 },
              {
                title: 'Amount',
                dataIndex: 'amount_cents',
                render: (c: number) => (c ? `${(c / 100).toFixed(2)}` : '-'),
              },
              {
                title: 'Created',
                dataIndex: 'created_at',
                render: (d: any) => (d ? new Date(d).toLocaleString() : '-'),
              },
              {
                title: 'Action',
                render: (_: any, r: any) => (
                  <Button type="primary" size="small" onClick={() => verifyEditionProof(r.id)}>
                    Verify
                  </Button>
                ),
              },
            ]}
          />
        ) : (
          <p style={{ color: '#888' }}>No pending edition purchase proofs.</p>
        )}
      </Card>

      <Card title="All Orders">
        <h4>Subscription Orders</h4>
        <Table
          rowKey="id"
          dataSource={data.subscriptionOrders}
          size="small"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: 'User', dataIndex: 'userEmail' },
            { title: 'Magazine', dataIndex: 'magazineTitle' },
            { title: 'Plan', dataIndex: 'planName' },
            {
              title: 'Amount',
              key: 'amt',
              render: (_: any, r: any) =>
                r.finalCents ? `${(r.finalCents / 100).toFixed(2)} ${r.currency}` : '-',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: any) => (
                <Tag color={s === 'PAID' ? 'green' : s === 'PENDING' ? 'orange' : 'default'}>
                  {s}
                </Tag>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: (d: any) => (d ? new Date(d).toLocaleString() : '-'),
            },
          ]}
        />
        <h4 style={{ marginTop: 24 }}>Edition Orders</h4>
        <Table
          rowKey="id"
          dataSource={data.editionOrders}
          size="small"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: 'ID', dataIndex: 'id', width: 60 },
            { title: 'User', dataIndex: 'userEmail' },
            { title: 'Magazine', dataIndex: 'magazineTitle' },
            {
              title: 'Edition',
              key: 'ed',
              render: (_: any, r: any) => (r.volume ? `Vol ${r.volume}` : r.editionId),
            },
            {
              title: 'Amount',
              key: 'amt',
              render: (_: any, r: any) =>
                r.amountCents ? `${(r.amountCents / 100).toFixed(2)} ${r.currency}` : '-',
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: any) => (
                <Tag color={s === 'PAID' ? 'green' : s === 'PENDING' ? 'orange' : 'default'}>
                  {s}
                </Tag>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              render: (d: any) => (d ? new Date(d).toLocaleString() : '-'),
            },
          ]}
        />
      </Card>
    </main>
  );
}
