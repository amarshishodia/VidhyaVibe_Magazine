'use client';
import { Card, Form, Select, InputNumber, Button, Input, message, Radio, Alert } from 'antd';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import React from 'react';

const DELIVERY_OPTIONS = [
  { value: 'ELECTRONIC', label: 'E-Magazine only (digital access)' },
  { value: 'PHYSICAL', label: 'Physical copy only' },
  { value: 'BOTH', label: 'Both (E-Magazine + Physical)' },
];

export default function SubscribePage() {
  const searchParams = useSearchParams();
  const magazineIdParam = searchParams?.get('magazineId');
  const [form] = Form.useForm();
  const [plans, setPlans] = React.useState<any[]>([]);
  const [magazines, setMagazines] = React.useState<any[]>([]);
  const [order, setOrder] = React.useState<any>(null);
  const [selectedMagazineId, setSelectedMagazineId] = React.useState<number | null>(
    magazineIdParam ? Number(magazineIdParam) : null,
  );
  const [deliveryMode, setDeliveryMode] = React.useState<'ELECTRONIC' | 'PHYSICAL' | 'BOTH'>(
    'ELECTRONIC',
  );
  const [selectedPlanId, setSelectedPlanId] = React.useState<number | null>(null);

  React.useEffect(() => {
    axios.get('/api/magazines').then((r) => setMagazines(r.data || []));
  }, []);

  React.useEffect(() => {
    const id = magazineIdParam ? Number(magazineIdParam) : selectedMagazineId;
    if (id) {
      axios.get(`/api/subscriptions/plans?magazineId=${id}`).then((r) => setPlans(r.data || []));
    } else {
      setPlans([]);
    }
  }, [selectedMagazineId, magazineIdParam]);

  const filteredPlans = plans.filter((p) => p.deliveryMode === deliveryMode);
  const selectedPlan = selectedPlanId ? plans.find((p) => p.id === selectedPlanId) : null;
  const priceCents =
    selectedPlan?.prices?.[deliveryMode]?.priceCents ?? selectedPlan?.priceCents ?? 0;
  const currency =
    selectedPlan?.prices?.[deliveryMode]?.currency ?? selectedPlan?.currency ?? 'INR';
  const needsAddress = deliveryMode === 'PHYSICAL' || deliveryMode === 'BOTH';
  const minMonths = selectedPlan?.minMonths ?? 1;
  const maxMonths = selectedPlan?.maxMonths;

  async function onFinish(values: any) {
    const token = localStorage.getItem('access_token');
    if (!token) {
      message.error('Please login first');
      return;
    }
    const magazineId = values.magazineId
      ? Number(values.magazineId)
      : magazineIdParam
        ? Number(magazineIdParam)
        : undefined;
    if (!magazineId) {
      message.error('Please select a magazine to subscribe');
      return;
    }
    try {
      const payload = { ...values, magazineId, deliveryMode: values.deliveryMode ?? deliveryMode };
      const res = await axios.post('/api/payments/create-order', payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrder(res.data);
      message.success('Order created');
    } catch (e: any) {
      message.error(e.response?.data?.error || e.response?.data?.message || 'failed');
    }
  }

  async function uploadProof(file: File) {
    if (!order) return;
    const fd = new FormData();
    fd.append('proof', file);
    const res = await axios.post(`/api/payments/${order.orderId}/proof`, fd, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data?.proofId) {
      message.success('Proof uploaded, awaiting admin verification');
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title="Subscribe">
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            deliveryMode: 'ELECTRONIC',
            ...(magazineIdParam ? { magazineId: Number(magazineIdParam) } : {}),
          }}
          form={form}
          onValuesChange={(_, all) => {
            if (all.magazineId != null) setSelectedMagazineId(Number(all.magazineId));
            if (all.planId != null) {
              setSelectedPlanId(Number(all.planId));
              const plan = plans.find((p) => p.id === all.planId);
              if (plan) form.setFieldValue('months', plan.minMonths ?? 1);
            }
            if (all.deliveryMode != null) {
              setDeliveryMode(all.deliveryMode);
              setSelectedPlanId(null);
              form.setFieldValue('planId', undefined);
              form.setFieldValue('months', undefined);
            }
          }}
        >
          <Form.Item
            name="magazineId"
            label="Magazine"
            rules={[{ required: true, message: 'Select a magazine' }]}
          >
            <Select
              placeholder="Select magazine"
              allowClear={false}
              options={magazines.map((m: any) => ({ label: m.title, value: m.id }))}
              onChange={(v) => setSelectedMagazineId(v ? Number(v) : null)}
            />
          </Form.Item>
          <Form.Item
            name="deliveryMode"
            label="Delivery type"
            rules={[{ required: true }]}
            initialValue="ELECTRONIC"
          >
            <Radio.Group options={DELIVERY_OPTIONS} onChange={() => setSelectedPlanId(null)} />
          </Form.Item>
          <Form.Item
            name="planId"
            label="Plan"
            rules={[{ required: true, message: 'Select a plan' }]}
            extra={
              deliveryMode && selectedMagazineId
                ? `Prices shown for ${deliveryMode === 'ELECTRONIC' ? 'E-Magazine' : deliveryMode === 'PHYSICAL' ? 'Physical' : 'Both'}`
                : undefined
            }
          >
            <Select
              placeholder={
                selectedMagazineId
                  ? deliveryMode
                    ? filteredPlans.length
                      ? 'Select a plan'
                      : 'No plans for this delivery type'
                    : 'Select delivery type first'
                  : 'Select a magazine first'
              }
              disabled={!selectedMagazineId || !deliveryMode}
              options={filteredPlans.map((p) => {
                const price = p.prices?.[deliveryMode]?.priceCents ?? p.priceCents ?? 0;
                const curr = p.prices?.[deliveryMode]?.currency ?? p.currency ?? 'INR';
                const monthsLabel =
                  p.minMonths === p.maxMonths && p.maxMonths
                    ? `${p.minMonths} mo`
                    : p.maxMonths
                      ? `${p.minMonths}-${p.maxMonths} mo`
                      : `${p.minMonths}+ mo`;
                return {
                  label: `${p.name} (${monthsLabel}) - ${curr === 'INR' ? '₹' : ''}${(price / 100).toFixed(2)} ${curr}/mo`,
                  value: p.id,
                };
              })}
              onChange={(v) => {
                setSelectedPlanId(v ? Number(v) : null);
                const plan = plans.find((p) => p.id === v);
                if (plan) form.setFieldValue('months', plan.minMonths ?? 1);
              }}
            />
          </Form.Item>
          {selectedPlan && (
            <div style={{ marginBottom: 16, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
              <strong>Price:</strong> {currency === 'INR' ? '₹' : ''}
              {(priceCents / 100).toFixed(2)} {currency} per month
              {needsAddress && (
                <Alert
                  type="info"
                  message="Physical delivery requires a shipping address. Please ensure your profile has an address saved."
                  style={{ marginTop: 12 }}
                  showIcon
                />
              )}
            </div>
          )}
          <Form.Item
            name="months"
            label="Months"
            rules={[{ required: true, message: 'Select months' }]}
            extra={
              selectedPlan && minMonths === maxMonths && maxMonths
                ? 'Fixed duration for this plan'
                : undefined
            }
          >
            <InputNumber
              min={minMonths}
              max={maxMonths ?? undefined}
              disabled={!!selectedPlan && minMonths === maxMonths && !!maxMonths}
            />
          </Form.Item>
          <Form.Item name="couponCode" label="Coupon code">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Order
            </Button>
          </Form.Item>
        </Form>

        {order && (
          <div style={{ marginTop: 20 }}>
            <h3>Pay via UPI</h3>
            <p>
              Amount: {(order.finalCents / 100).toFixed(2)} {order.currency}
            </p>
            <img
              src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(order.upi)}`}
              alt="QR"
            />
            <p>Or UPI URI: {order.upi}</p>
            <p>
              <label>
                Upload payment proof:{' '}
                <input
                  type="file"
                  onChange={(e) => e.target.files && uploadProof(e.target.files[0])}
                />
              </label>
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}
