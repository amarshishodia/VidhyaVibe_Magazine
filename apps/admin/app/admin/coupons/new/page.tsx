"use client";
import React from "react";
import { Card, Form, Input, InputNumber, Button, DatePicker, Switch, Select } from "antd";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function NewCouponPage() {
  const router = useRouter();

  const [form] = Form.useForm();

  async function onFinish(values: any) {
    // transform date
    if (values.expiresAt) values.expiresAt = values.expiresAt.toISOString();
    await axios.post("/api/admin/coupons", values, { withCredentials: true });
    router.push("/admin/coupons");
  }

  return (
    <main style={{ padding: 24 }}>
      <Card title="New Coupon">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="code" label="Code" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input />
          </Form.Item>
          <Form.Item name="discountPct" label="Discount %">
            <InputNumber min={0} max={100} />
          </Form.Item>
          <Form.Item name="discountCents" label="Discount (cents)">
            <InputNumber min={0} />
          </Form.Item>
          <Form.Item name="expiresAt" label="Expires At">
            <DatePicker showTime />
          </Form.Item>
          <Form.Item name="maxUses" label="Max Uses">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="perUserLimit" label="Per-user Limit">
            <InputNumber min={1} />
          </Form.Item>
          <Form.Item name="active" label="Active" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
          <Form.Item name="planId" label="Plan (optional)">
            <Select allowClear>
              {/* fetched client-side could be implemented */}
            </Select>
          </Form.Item>
          <Form.Item name="magazineId" label="Magazine (optional)">
            <Select allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}

