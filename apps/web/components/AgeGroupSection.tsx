import Link from 'next/link';
import React from 'react';

const AgeGroupCard = ({ age, color, link }: { age: string; color: string; link: string }) => (
  <Link href={link} style={{ display: 'block', width: '100%' }}>
    <div
      style={{
        backgroundColor: color,
        padding: '2rem',
        borderRadius: '15px',
        textAlign: 'center',
        color: 'white',
        transition: 'transform 0.3s ease',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
      }}
      className="age-card"
    >
      <h3 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{age}</h3>
      <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>Years Old</p>
    </div>
  </Link>
);

const AgeGroupSection = () => {
  return (
    <section id="age-groups" style={{ padding: '4rem 0' }}>
      <div className="container">
        <h2 style={{ textAlign: 'center', marginBottom: '3rem', fontSize: '2.5rem' }}>
          Choose Your Age Group
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
          }}
        >
          <AgeGroupCard age="8-11" color="#FF6B6B" link="/magazines/8-11" />
          <AgeGroupCard age="12-14" color="#4ECDC4" link="/magazines/12-14" />
          <AgeGroupCard age="15-16" color="#FFE66D" link="/magazines/15-16" />
          <AgeGroupCard age="17-18" color="#1A535C" link="/magazines/17-18" />
        </div>
      </div>
    </section>
  );
};

export default AgeGroupSection;
