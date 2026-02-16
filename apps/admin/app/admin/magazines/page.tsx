"use client";
import React from 'react';
import { Button, Card, List } from 'antd';
import api from '../../../lib/api';
import Link from 'next/link';

export default function MagazinesPage() {
  const [magazines, setMagazines] = React.useState<any[]>([]);

  React.useEffect(() => {
    api.get('/admin/magazines/list').then((r) => setMagazines(r.data || []));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <Card title="Magazines">
        <p>
          <Link href="/admin/magazines/new">
            <Button type="primary">New Magazine</Button>
          </Link>
        </p>
        <List
          dataSource={magazines}
          renderItem={(m: any) => (
            <List.Item key={m.id}>
              <List.Item.Meta title={m.title} description={m.slug} />
              <div style={{ display: 'flex', gap: '1rem' }}>
                <Link href={`/admin/magazines/${m.id}`}>Open</Link>
                <Link href={`/admin/magazines/${m.id}/edit`}>Edit</Link>
              </div>
            </List.Item>
          )}
        />
      </Card>
    </main>
  );
}

