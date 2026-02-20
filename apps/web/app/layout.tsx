import { App, ConfigProvider } from 'antd';
import React from 'react';
import './globals.css';
import AuthProvider from '../components/AuthProvider';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import StyledComponentsRegistry from '../lib/AntdRegistry';

export const metadata = {
  title: 'Magazine for Kids',
  description: 'Interactive and colorful magazine for students.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#FF6B6B',
              },
            }}
          >
            <App>
              <AuthProvider>
                <Navbar />
                {children}
              </AuthProvider>
            </App>
            <Footer />
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
