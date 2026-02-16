import React from 'react';
import { App, ConfigProvider } from 'antd';
import './globals.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StyledComponentsRegistry from '../lib/AntdRegistry';

export const metadata = {
  title: 'Magazine for Kids',
  description: 'Interactive and colorful magazine for students.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
              <Navbar />
              {children}
            </App>
            <Footer />
          </ConfigProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  )
}
