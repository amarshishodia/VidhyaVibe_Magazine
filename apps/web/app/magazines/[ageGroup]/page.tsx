'use client';

import React, { useEffect, useState } from 'react';
import MagazineCard from '../../../components/MagazineCard';
import axios from 'axios';

interface Magazine {
    id: number;
    title: string;
    description: string;
    coverKey?: string;
    category: string;
    createdAt: string;
}

export default function AgeGroupPage({ params }: { params: { ageGroup: string } }) {
    const { ageGroup } = params;
    const [magazines, setMagazines] = useState<Magazine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`/api/magazines?category=${ageGroup}`);
                setMagazines(response.data || []);
            } catch (err) {
                console.error('Failed to fetch age group magazines:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [ageGroup]);

    return (
        <main style={{ padding: '4rem 0', minHeight: '80vh' }}>
            <div className="container">
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: '3rem',
                    fontSize: '3rem',
                    color: 'var(--primary-color)'
                }}>
                    Magazines for Ages {ageGroup}
                </h1>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
                ) : magazines.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2rem'
                    }}>
                        {magazines.map((mag) => (
                            <MagazineCard
                                key={mag.id}
                                title={mag.title}
                                description={mag.description}
                                date={new Date(mag.createdAt).getFullYear().toString()}
                                image={mag.coverKey ? `/api/assets/serve?key=${mag.coverKey}` : ''}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', fontSize: '1.2rem', color: '#666' }}>
                        <p>No magazines found for this age group at the moment. Check back soon!</p>
                    </div>
                )}
            </div>
        </main>
    );
}
