import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f1f5f9', textAlign: 'center', padding: 24 }}>
      <div>
        <div style={{ fontSize: 80, marginBottom: 24 }}>404</div>
        <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', marginBottom: 12 }}>Page Not Found</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>The page you're looking for doesn't exist.</p>
        <Link to="/" style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Go Home</Link>
      </div>
    </div>
  );
}
