import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Save, Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', timezone: user?.timezone || 'UTC' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('profile');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10,
    color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 8, letterSpacing: '-0.5px' }}>Profile Settings</h1>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Manage your account information</p>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32, padding: 24, background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 700, color: '#fff'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{user?.name}</h3>
            <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 4px' }}>{user?.email}</p>
            <span style={{
              fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 700, textTransform: 'uppercase',
              background: user?.role === 'provider' ? 'rgba(139,92,246,0.2)' : 'rgba(16,185,129,0.2)',
              color: user?.role === 'provider' ? '#a78bfa' : '#34d399'
            }}>{user?.role}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {['profile', 'password'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '8px 20px', borderRadius: 10, border: 'none', fontSize: 14, fontWeight: 600,
              background: tab === t ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
              color: '#fff', cursor: 'pointer', textTransform: 'capitalize'
            }}>{t}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <form onSubmit={handleProfileSave} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            {[
              { field: 'name', label: 'Full Name', icon: User },
              { field: 'phone', label: 'Phone', icon: Phone }
            ].map(({ field, label, icon: Icon }) => (
              <div key={field} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
                <input value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder={label} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input value={user?.email} disabled style={{ ...inputStyle, color: '#64748b', cursor: 'not-allowed' }} />
              <p style={{ color: '#4b5563', fontSize: 12, marginTop: 4 }}>Email cannot be changed</p>
            </div>
            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer'
            }}>
              <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {tab === 'password' && (
          <form onSubmit={handlePasswordChange} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            {[
              { field: 'currentPassword', label: 'Current Password' },
              { field: 'newPassword', label: 'New Password' },
              { field: 'confirmPassword', label: 'Confirm New Password' }
            ].map(({ field, label }) => (
              <div key={field} style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>
                <input type="password" required value={pwForm[field]} onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                  placeholder="••••••••" style={inputStyle} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 10,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer'
            }}>
              <Lock size={16} /> {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
