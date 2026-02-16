'use client';

import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Spin, Alert } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import api from '../../../lib/api';

interface UserType {
    key: string;
    id: number;
    name: string;
    email: string;
    role: string;
    status: string;
    joinedAt: string;
}

const columns: ColumnsType<UserType> = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role) => (
            <Tag color={role === 'admin' ? 'volcano' : 'geekblue'}>
                {(role || 'user').toUpperCase()}
            </Tag>
        ),
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => (
            <Tag color={status === 'active' ? 'green' : 'red'}>
                {(status || 'active').toUpperCase()}
            </Tag>
        ),
    },
    {
        title: 'Joined Date',
        dataIndex: 'joinedAt',
        key: 'joinedAt',
    },
    {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button onClick={() => alert(`Edit ${record.name || record.email}`)}>Edit</Button>
            </Space>
        ),
    },
];

export default function UsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                // Fetch all users from the admin endpoint
                const response = await api.get('/admin/users');
                const usersData = response.data || [];

                // Transform user data to table format
                const transformedUsers: UserType[] = usersData.map((u: any, index: number) => ({
                    key: String(u.id || index),
                    id: u.id,
                    name: u.name || 'Anonymous',
                    email: u.email,
                    role: u.isAdmin ? 'admin' : 'user',
                    status: 'active',
                    joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
                }));

                setUsers(transformedUsers);
            } catch (err: any) {
                console.error('Failed to fetch users:', err);
                setError('Failed to load users. Using sample data.');

                // Fallback to sample data
                setUsers([
                    {
                        key: '1',
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        role: 'user',
                        status: 'active',
                        joinedAt: '2023-01-15',
                    },
                    {
                        key: '2',
                        id: 2,
                        name: 'Admin User',
                        email: 'admin@magazine.com',
                        role: 'admin',
                        status: 'active',
                        joinedAt: '2023-01-01',
                    },
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div>
            <h1 style={{ marginBottom: 16 }}>User Management</h1>
            {error && <Alert message={error} type="warning" showIcon style={{ marginBottom: 16 }} />}
            <Table columns={columns} dataSource={users} />
        </div>
    );
}
