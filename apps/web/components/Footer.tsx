import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#2C3E50',
            color: '#fff',
            padding: '2rem',
            textAlign: 'center',
            marginTop: 'auto'
        }}>
            <div className="container">
                <p>&copy; {new Date().getFullYear()} Magazine Kids. All rights reserved.</p>
                <div style={{ marginTop: '1rem' }}>
                    <a href="#" style={{ margin: '0 10px', color: '#fff' }}>Terms</a>
                    <a href="#" style={{ margin: '0 10px', color: '#fff' }}>Privacy</a>
                    <a href="#" style={{ margin: '0 10px', color: '#fff' }}>Contact</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
