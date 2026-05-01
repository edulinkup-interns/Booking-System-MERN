// ForgotPasswordPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { Mail, Calendar, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Calendar size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800, fontFamily: 'Georgia,serif', margin: '0 0 8px' }}>
            {sent ? 'Check your email' : 'Reset Password'}
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>
            {sent ? `We sent a reset link to ${email}` : 'Enter your email to receive a reset link'}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 13, borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer'
            }}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.7 }}>
              Click the link in the email to reset your password. The link expires in 1 hour.
            </p>
          </div>
        )}

        <Link to="/login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 20, color: '#64748b', textDecoration: 'none', fontSize: 14 }}>
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
