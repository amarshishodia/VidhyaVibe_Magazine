import React from 'react';
import { Button } from 'antd';

interface MagazineCardProps {
    title: string;
    image: string;
    date: string;
    description: string;
}

const MagazineCard = ({ title, image, date, description }: MagazineCardProps) => {
    return (
        <div style={{
            backgroundColor: 'white',
            borderRadius: '15px',
            overflow: 'hidden',
            boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{
                height: '200px',
                backgroundColor: '#eee',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa'
            }}>
                {/* Placeholder for image */}
                {image ? <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : 'Cover Image'}
            </div>
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>{date}</div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#333' }}>{title}</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem', flex: 1 }}>{description}</p>
                <Button type="primary" block>Read Now</Button>
            </div>
        </div>
    );
};

export default MagazineCard;
