import React from 'react';
import { Button } from 'antd';
import Link from 'next/link';

const Hero = () => {
    return (
        <section style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--accent-color)',
            borderRadius: '0 0 50% 50% / 4%',
            marginBottom: '3rem'
        }}>
            <div className="container">
                <h1 style={{
                    fontSize: '3.5rem',
                    marginBottom: '1.5rem',
                    color: 'var(--text-color)',
                    fontWeight: '800'
                }}>
                    Discover the World with <span style={{ color: 'var(--primary-color)' }}>Magazine Kids</span>
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    marginBottom: '2rem',
                    maxWidth: '600px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    lineHeight: '1.6'
                }}>
                    Explore amazing stories, fun facts, and learning adventures tailored just for you!
                    Choose your age group and start reading today.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Link href="#age-groups">
                        <Button type="primary" size="large" style={{
                            backgroundColor: 'var(--primary-color)',
                            borderColor: 'var(--primary-color)',
                            height: '50px',
                            padding: '0 40px',
                            fontSize: '1.1rem'
                        }}>
                            Start Reading
                        </Button>
                    </Link>
                    <Link href="/about">
                        <Button size="large" style={{
                            height: '50px',
                            padding: '0 40px',
                            fontSize: '1.1rem'
                        }}>
                            Learn More
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Hero;
