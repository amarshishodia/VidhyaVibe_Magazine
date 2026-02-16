'use client';

import React from 'react';
import MagazineCard from '../../components/MagazineCard';
import { Button, Empty } from 'antd';
import Link from 'next/link';

export default function DashboardPage() {
    // Mock data for subscribed magazines
    const subscribedMagazines = [
        { title: 'Space Explorers', date: 'October 2023', description: 'Journey to the stars and beyond.', image: '', id: 'space-explorers' },
        { title: 'Dino Discovery', date: 'September 2023', description: 'Roar with the dinosaurs!', image: '', id: 'dino-discovery' },
    ];

    return (
        <main style={{ padding: '4rem 0', minHeight: '80vh', backgroundColor: '#f9f9f9' }}>
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', color: 'var(--primary-color)' }}>My Dashboard</h1>
                    <Link href="/magazines/8-11">
                        <Button type="primary" size="large">Browse Magazines</Button>
                    </Link>
                </div>

                <section style={{ marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>My Subscriptions</h2>
                    {subscribedMagazines.length > 0 ? (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem'
                        }}>
                            {subscribedMagazines.map((mag, index) => (
                                <div key={index} style={{ position: 'relative' }}>
                                    <MagazineCard
                                        title={mag.title}
                                        date={mag.date}
                                        description={mag.description}
                                        image={mag.image}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '20px',
                                        right: '20px'
                                    }}>
                                        <Link href={`/read/${mag.id}`}>
                                            <Button type="primary" block style={{
                                                backgroundColor: 'var(--secondary-color)',
                                                borderColor: 'var(--secondary-color)',
                                                fontWeight: 'bold'
                                            }}>
                                                Read Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty description="You haven't subscribed to any magazines yet." />
                    )}
                </section>
            </div>
        </main>
    );
}
