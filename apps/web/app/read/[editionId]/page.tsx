import React from 'react';
import Link from 'next/link';
import { Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ReaderPage({ params }: { params: { editionId: string } }) {
    const { editionId } = params;

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#f0f2f5',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <header style={{
                padding: '1rem 2rem',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/dashboard">
                        <Button icon={<ArrowLeftOutlined />} shape="circle" />
                    </Link>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{editionId.replace('-', ' ').toUpperCase()}</span>
                </div>
                <div>
                    {/* Controls could go here */}
                </div>
            </header>

            <main style={{
                flex: 1,
                padding: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{
                    width: '80%',
                    maxWidth: '800px',
                    height: '80vh',
                    backgroundColor: 'white',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.1)',
                    borderRadius: '10px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    padding: '2rem'
                }}>
                    <h2>Reader View</h2>
                    <p>Content for {editionId} would appear here.</p>
                    <div style={{ marginTop: '2rem', width: '100%', height: '100%', backgroundColor: '#eee', borderRadius: '5px' }}>
                        {/* Placeholder for PDF or content renderer */}
                        <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            color: '#aaa'
                        }}>
                            [ Magazine Pages Go Here ]
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
