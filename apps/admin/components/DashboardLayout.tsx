'use client';

import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ReadOutlined,
  LogoutOutlined,
  TeamOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Button, theme } from 'antd';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

const { Header, Sider, Content } = Layout;

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const getSelectedKey = () => {
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/magazines')) return 'magazines';
    if (pathname.includes('/plans')) return 'plans';
    if (pathname.includes('/subscriptions')) return 'subscriptions';
    if (pathname.includes('/readers')) return 'readers';
    if (pathname.includes('/orders')) return 'orders';
    return 'dashboard';
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true });
    } catch (e) {
      // ignore logout API errors
    }
    localStorage.removeItem('access_token');
    window.location.href = '/admin/login';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="dark">
        <div
          style={{
            padding: '16px',
            textAlign: 'center',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? 'M' : 'Magazine Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link href="/admin">Dashboard</Link>,
            },
            {
              key: 'magazines',
              icon: <ReadOutlined />,
              label: <Link href="/admin/magazines">Magazines</Link>,
            },
            {
              key: 'users',
              icon: <UserOutlined />,
              label: <Link href="/admin/users">Users</Link>,
            },
            {
              key: 'plans',
              icon: <DollarOutlined />,
              label: <Link href="/admin/plans">Plans & Pricing</Link>,
            },
            {
              key: 'subscriptions',
              icon: <TeamOutlined />,
              label: <Link href="/admin/subscriptions">Subscribers</Link>,
            },
            {
              key: 'readers',
              icon: <FileTextOutlined />,
              label: <Link href="/admin/readers">Readers</Link>,
            },
            {
              key: 'orders',
              icon: <ShoppingCartOutlined />,
              label: <Link href="/admin/orders">Orders</Link>,
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
