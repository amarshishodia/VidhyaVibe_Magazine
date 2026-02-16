'use client';

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Spin, Alert } from 'antd';
import { ReadOutlined, UserOutlined, RiseOutlined, FileTextOutlined } from '@ant-design/icons';
import api from '../../lib/api';

interface DashboardStats {
  totalUsers: number;
  totalMagazines: number;
  totalSubscriptions: number;
  monthlyRevenue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const response = await api.get('/admin/dashboard/summary');
        const data = response.data;

        setStats({
          totalUsers: data.totalUsers || 0,
          totalMagazines: data.totalMagazines || 0,
          totalSubscriptions: data.totalSubscriptions || 0,
          monthlyRevenue: (data.totalRevenueCents || 0) / 100,
        });
      } catch (err: any) {
        console.error('Failed to fetch dashboard stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  return (
    <>
      <h1 style={{ fontSize: '24px', marginBottom: '24px' }}>Dashboard Overview</h1>
      <Row gutter={[16, 16]}>
        <Col span={6} xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Users"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Active Magazines"
              value={stats?.totalMagazines || 0}
              prefix={<ReadOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Subscriptions"
              value={stats?.totalSubscriptions || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#096dd9' }}
            />
          </Card>
        </Col>
        <Col span={6} xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Monthly Revenue"
              value={stats?.monthlyRevenue || 0}
              prefix={<RiseOutlined />}
              suffix="$"
              valueStyle={{ color: '#d48806' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col span={12} xs={24} md={12}>
            <Card title="Recent Activity">
              <p>Loading recent activity...</p>
            </Card>
          </Col>
          <Col span={12} xs={24} md={12}>
            <Card title="Quick Actions">
              <ul>
                <li><a href="/admin/magazines/create">Add New Magazine</a></li>
                <li><a href="/admin/users">View Users</a></li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
