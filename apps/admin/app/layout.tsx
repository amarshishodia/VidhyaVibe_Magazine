import React from 'react';
import { App, ConfigProvider } from 'antd';
import StyledComponentsRegistry from '../lib/AntdRegistry';
import DashboardLayout from '../components/DashboardLayout';
import './globals.css';

export const metadata = {
  title: 'Magazine Admin',
  description: 'Admin panel for Magazine Subscription Service',
};

export default function RootLayout({
  children,
}: React.PropsWithChildren) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1890ff',
              }
            }}
          >
            <App>
              {/* @ts-ignore */}
              <DashboardLayout>
                {children}
              </DashboardLayout>
            </App>
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
