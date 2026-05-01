import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Calendar, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'client' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role);
      navigate(user.role === 'provider' ? '/provider/setup' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
    <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
          }}>
            <Calendar size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 26, fontWeight: 800, fontFamily: 'Georgia, serif', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            Create an account
          </h1>
          <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Join thousands of BookEase users</p>
        </div>

        {/* Role selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
          {['client', 'provider'].map(role => (
            <button key={role} type="button" onClick={() => setForm(p => ({ ...p, role }))} style={{
              padding: '10px', borderRadius: 10,
              background: form.role === role ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))' : 'rgba(15,23,42,0.5)',
              border: `1px solid ${form.role === role ? '#6366f1' : 'rgba(99,102,241,0.15)'}`,
              color: form.role === role ? '#a78bfa' : '#64748b',
              fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize'
            }}>
              {role === 'client' ? '👤 Client' : '🏢 Provider'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { field: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
            { field: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
          ].map(({ field, label, type, icon: Icon, placeholder }) => (
            <div key={field} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type={type} required value={form[field]}
                  onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                />
              </div>
            </div>
          ))}

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input type={showPw ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Min 8 chars, uppercase & number"
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
            width: '100%', padding: 13, borderRadius: 10,
            background: loading ? '#374151' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: loading ? 'none' : '0 4px 20px rgba(99,102,241,0.4)'
          }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginTop: 16 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
