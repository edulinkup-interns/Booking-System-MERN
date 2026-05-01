import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Calendar, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'provider' ? '/provider/dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px 12px 44px',
    background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(99,102,241,0.2)',
    borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none',
    boxSizing: 'border-box', transition: 'border-color 0.2s'
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(30, 41, 59, 0.8)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 24, padding: 40,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Calendar size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 800, fontFamily: 'Georgia, serif', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Sign in to your BookEase account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="email" required value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ color: '#94a3b8', fontSize: 13, fontWeight: 600 }}>Password</label>
              <Link to="/forgot-password" style={{ color: '#818cf8', fontSize: 13, textDecoration: 'none' }}>Forgot password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type={showPw ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer'
              }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px', borderRadius: 10,
            background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)', transition: 'all 0.2s'
          }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: 24, padding: 16, borderRadius: 10,
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)'
        }}>
          <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 1 }}>Demo Accounts</p>
          {[
            { role: 'Client', email: 'client@demo.com', pass: 'Demo@12345' },
            { role: 'Provider', email: 'provider@demo.com', pass: 'Demo@12345' }
          ].map(d => (
            <div key={d.role} style={{ marginBottom: 6 }}>
              <span style={{ color: '#818cf8', fontSize: 12, fontWeight: 600 }}>{d.role}: </span>
              <span style={{ color: '#94a3b8', fontSize: 12 }}>{d.email} / {d.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
