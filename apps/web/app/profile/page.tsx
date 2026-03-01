'use client';

import {
  UserOutlined,
  TeamOutlined,
  BookOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { Card, Form, Input, Button, message, Spin, Tabs, Select, InputNumber, Divider } from 'antd';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const { TabPane } = Tabs;
const { Option } = Select;

interface UserProfile {
  id: number;
  email: string;
  name?: string;
  phone?: string;
}

interface Guardian {
  id: number;
  name: string;
  phone?: string;
  relation?: string;
}

interface Reader {
  id: number;
  name: string;
  dob?: string;
  age?: number;
  className?: string;
  schoolName?: string;
  schoolCity?: string;
  deliveryMode?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [readers, setReaders] = useState<Reader[]>([]);

  // Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingGuardianId, setEditingGuardianId] = useState<number | null>(null);
  const [editingReaderId, setEditingReaderId] = useState<number | null>(null);
  const [addingReader, setAddingReader] = useState(false);

  const [profileForm] = Form.useForm();
  const [guardianForm] = Form.useForm();
  const [readerForm] = Form.useForm();
  const [newReaderForm] = Form.useForm();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      router.replace('/login?redirect=/profile');
      return;
    }
    fetchAll(token);
  }, []);

  async function fetchAll(token: string) {
    setLoading(true);
    try {
      const [meRes, readersRes] = await Promise.all([
        axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/readers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setUser(meRes.data);
      setReaders(readersRes.data || []);

      // Fetch guardians - not a dedicated API, we read from user profile
      // We'll store guardian data fetched during me lookup
    } catch (err: any) {
      if (err?.response?.status === 401) {
        localStorage.removeItem('access_token');
        router.replace('/login?redirect=/profile');
      } else {
        message.error('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  // ── Personal Info ──────────────────────────────────────────────────────────
  const startEditProfile = () => {
    profileForm.setFieldsValue({ name: user?.name, phone: user?.phone });
    setEditingProfile(true);
  };

  const saveProfile = async () => {
    const vals = await profileForm.validateFields();
    try {
      await axios.put('/api/auth/me', vals, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser((u) => u && { ...u, ...vals });
      setEditingProfile(false);
      message.success('Profile updated!');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Update failed');
    }
  };

  // ── Reader (School) info ───────────────────────────────────────────────────
  const startEditReader = (r: Reader) => {
    setEditingReaderId(r.id);
    readerForm.setFieldsValue({
      name: r.name,
      age: r.age,
      className: r.className,
      schoolName: r.schoolName,
      schoolCity: r.schoolCity,
      dob: r.dob ? r.dob.split('T')[0] : undefined,
      deliveryMode: r.deliveryMode || 'ELECTRONIC',
    });
  };

  const saveReader = async () => {
    if (!editingReaderId) return;
    const vals = await readerForm.validateFields();
    try {
      await axios.put(`/api/readers/${editingReaderId}`, vals, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReaders((rs) => rs.map((r) => (r.id === editingReaderId ? { ...r, ...vals } : r)));
      setEditingReaderId(null);
      message.success('Reader info updated!');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Update failed');
    }
  };

  const createReader = async () => {
    const vals = await newReaderForm.validateFields();
    try {
      const res = await axios.post('/api/readers', vals, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReaders((rs) => [...rs, { id: res.data.id, ...vals }]);
      setAddingReader(false);
      newReaderForm.resetFields();
      message.success('Reader added!');
    } catch (e: any) {
      message.error(e.response?.data?.error || 'Failed to add reader');
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    borderRadius: 16,
    boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
    marginBottom: 24,
  };

  const sectionTitle = (icon: React.ReactNode, text: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <span style={{ fontSize: 22, color: 'var(--primary-color)' }}>{icon}</span>
      <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#333' }}>{text}</h2>
    </div>
  );

  return (
    <main style={{ padding: '3rem 0', minHeight: '80vh', backgroundColor: '#f7f8fa' }}>
      <div className="container" style={{ maxWidth: 780 }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', marginBottom: '2rem' }}>
          My Profile
        </h1>

        {/* ── Personal Information ── */}
        <Card style={cardStyle}>
          {sectionTitle(<UserOutlined />, 'Personal Information')}
          {editingProfile ? (
            <Form form={profileForm} layout="vertical">
              <Form.Item name="name" label="Full Name">
                <Input placeholder="Your name" size="large" />
              </Form.Item>
              <Form.Item name="phone" label="Phone Number">
                <Input placeholder="Your phone number" size="large" />
              </Form.Item>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="primary" icon={<SaveOutlined />} onClick={saveProfile} size="large">
                  Save
                </Button>
                <Button
                  icon={<CloseOutlined />}
                  onClick={() => setEditingProfile(false)}
                  size="large"
                >
                  Cancel
                </Button>
              </div>
            </Form>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  marginBottom: 20,
                }}
              >
                <div>
                  <div style={{ color: '#888', fontSize: 13 }}>Full Name</div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{user?.name || '—'}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 13 }}>Email</div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{user?.email}</div>
                </div>
                <div>
                  <div style={{ color: '#888', fontSize: 13 }}>Phone</div>
                  <div style={{ fontSize: 16, fontWeight: 500 }}>{user?.phone || '—'}</div>
                </div>
              </div>
              <Button icon={<EditOutlined />} onClick={startEditProfile}>
                Edit Personal Info
              </Button>
            </>
          )}
        </Card>

        {/* ── Readers / School Information ── */}
        <Card style={cardStyle}>
          {sectionTitle(<BookOutlined />, 'Readers & School Information')}
          <p style={{ color: '#666', marginBottom: 20 }}>
            Each reader profile tracks a child's details including school information.
          </p>

          {readers.map((r) => (
            <div key={r.id}>
              <Divider orientation="left" style={{ color: '#555', fontWeight: 600 }}>
                {r.name}
              </Divider>
              {editingReaderId === r.id ? (
                <Form form={readerForm} layout="vertical">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Form.Item name="name" label="Reader Name" rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name="age" label="Age">
                      <InputNumber min={1} max={100} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="dob" label="Date of Birth">
                      <Input type="date" />
                    </Form.Item>
                    <Form.Item name="className" label="Class / Grade">
                      <Input placeholder="e.g. 6th Grade" />
                    </Form.Item>
                    <Form.Item name="schoolName" label="School Name">
                      <Input placeholder="e.g. ABC Public School" />
                    </Form.Item>
                    <Form.Item name="schoolCity" label="School City">
                      <Input placeholder="e.g. Mumbai" />
                    </Form.Item>
                    <Form.Item name="deliveryMode" label="Preferred Delivery">
                      <Select>
                        <Option value="ELECTRONIC">E-Magazine</Option>
                        <Option value="PHYSICAL">Physical Copy</Option>
                        <Option value="BOTH">Both</Option>
                      </Select>
                    </Form.Item>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <Button type="primary" icon={<SaveOutlined />} onClick={saveReader}>
                      Save
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={() => setEditingReaderId(null)}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              ) : (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.75rem 1.5rem',
                      marginBottom: 12,
                    }}
                  >
                    {[
                      ['Age', r.age],
                      ['Class', r.className],
                      ['School', r.schoolName],
                      ['City', r.schoolCity],
                      ['Delivery', r.deliveryMode],
                    ].map(([label, val]) => (
                      <div key={String(label)}>
                        <div style={{ color: '#888', fontSize: 12 }}>{label}</div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{val || '—'}</div>
                      </div>
                    ))}
                  </div>
                  <Button icon={<EditOutlined />} onClick={() => startEditReader(r)} size="small">
                    Edit
                  </Button>
                </>
              )}
            </div>
          ))}

          {readers.length === 0 && !addingReader && (
            <p style={{ color: '#aaa', fontStyle: 'italic' }}>No readers added yet.</p>
          )}

          <Divider />

          {addingReader ? (
            <>
              <h3 style={{ marginBottom: 16 }}>Add New Reader</h3>
              <Form form={newReaderForm} layout="vertical">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Form.Item name="name" label="Reader Name" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item name="age" label="Age">
                    <InputNumber min={1} max={100} style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item name="dob" label="Date of Birth">
                    <Input type="date" />
                  </Form.Item>
                  <Form.Item name="className" label="Class / Grade">
                    <Input placeholder="e.g. 6th Grade" />
                  </Form.Item>
                  <Form.Item name="schoolName" label="School Name">
                    <Input placeholder="e.g. ABC Public School" />
                  </Form.Item>
                  <Form.Item name="schoolCity" label="School City">
                    <Input placeholder="e.g. Mumbai" />
                  </Form.Item>
                  <Form.Item
                    name="deliveryMode"
                    label="Preferred Delivery"
                    initialValue="ELECTRONIC"
                  >
                    <Select>
                      <Option value="ELECTRONIC">E-Magazine</Option>
                      <Option value="PHYSICAL">Physical Copy</Option>
                      <Option value="BOTH">Both</Option>
                    </Select>
                  </Form.Item>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button type="primary" icon={<SaveOutlined />} onClick={createReader}>
                    Add Reader
                  </Button>
                  <Button icon={<CloseOutlined />} onClick={() => setAddingReader(false)}>
                    Cancel
                  </Button>
                </div>
              </Form>
            </>
          ) : (
            <Button type="dashed" onClick={() => setAddingReader(true)} style={{ width: '100%' }}>
              + Add Reader Profile
            </Button>
          )}
        </Card>
      </div>
    </main>
  );
}
