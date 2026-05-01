import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { Lock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 420, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: 40, backdropFilter: 'blur(20px)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Calendar size={26} color="#fff" />
          </div>
          <h1 style={{ color: '#f1f5f9', fontSize: 24, fontWeight: 800, fontFamily: 'Georgia,serif', margin: '0 0 8px' }}>New Password</h1>
          <p style={{ color: '#64748b', fontSize: 14 }}>Must be at least 8 characters with uppercase and number</p>
        </div>
        <form onSubmit={handleSubmit}>
          {[
            { label: 'New Password', val: password, setVal: setPassword },
            { label: 'Confirm Password', val: confirm, setVal: setConfirm }
          ].map(({ label, val, setVal }) => (
            <div key={label} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type="password" required value={val} onChange={e => setVal(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '12px 16px 12px 44px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: 13, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: 8
          }}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        <Link to="/login" style={{ display: 'block', textAlign: 'center', marginTop: 16, color: '#64748b', textDecoration: 'none', fontSize: 14 }}>Back to login</Link>
      </div>
    </div>
  );
}
