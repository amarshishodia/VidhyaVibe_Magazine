"use client";
import React from "react";
import axios from "axios";
import { Card, Form, Select, InputNumber, Button, Input, message } from "antd";

export default function SubscribePage() {
  const [plans, setPlans] = React.useState<any[]>([]);
  const [order, setOrder] = React.useState<any>(null);
  React.useEffect(() => {
    axios.get("/api/subscriptions/plans").then((r) => setPlans(r.data || []));
  }, []);

  async function onFinish(values: any) {
    try {
      const res = await axios.post("/api/payments/create-order", values, { withCredentials: true });
      setOrder(res.data);
      message.success("Order created");
    } catch (e: any) {
      message.error(e.response?.data?.error || "failed");
    }
  }

  async function uploadProof(file: File) {
    if (!order) return;
    const fd = new FormData();
    fd.append("proof", file);
    const res = await axios.post(`/api/payments/${order.orderId}/proof`, fd, { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } });
    if (res.data?.proofId) {
      message.success("Proof uploaded, awaiting admin verification");
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title="Subscribe">
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="planId" label="Plan" rules={[{ required: true }]}>
            <Select options={plans.map((p) => ({ label: p.name, value: p.id }))} />
          </Form.Item>
          <Form.Item name="months" label="Months" rules={[{ required: true }]}>
            <InputNumber min={1} />
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
            <p>Amount: {(order.finalCents / 100).toFixed(2)} {order.currency}</p>
            <img src={`https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(order.upi)}`} alt="QR" />
            <p>Or UPI URI: {order.upi}</p>
            <p>
              <label>
                Upload payment proof: <input type="file" onChange={(e) => e.target.files && uploadProof(e.target.files[0])} />
              </label>
            </p>
          </div>
        )}
      </Card>
    </main>
  );
}

