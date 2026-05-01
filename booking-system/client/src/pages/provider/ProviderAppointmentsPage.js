// ProviderAppointmentsPage.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';

export default function ProviderAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ limit: 50 });
        if (filter !== 'all') q.set('status', filter);
        const { data } = await api.get(`/appointments?${q}`);
        setAppointments(data.data.appointments || []);
      } catch (e) { toast.error('Failed to load'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [filter]);

  const handleComplete = async (id) => {
    try {
      await api.patch(`/appointments/${id}/complete`);
      toast.success('Marked as complete');
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'completed' } : a));
    } catch (e) { toast.error('Failed'); }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Cancelled');
      setAppointments(prev => prev.map(a => a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch (e) { toast.error('Failed'); }
  };

  const statusColors = { confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 8 }}>Manage Appointments</h1>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all','confirmed','pending','completed','cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 600,
              background: filter === f ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
              color: '#fff', cursor: 'pointer', textTransform: 'capitalize'
            }}>{f}</button>
          ))}
        </div>

        {loading ? <div style={{ color: '#64748b', textAlign: 'center', padding: '60px 0' }}>Loading...</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>No appointments found</div>
            ) : appointments.map(apt => {
              const dt = new Date(apt.dateTime);
              return (
                <div key={apt._id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: '18px 24px', display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ width: 4, height: 52, borderRadius: 4, background: statusColors[apt.status] || '#64748b', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>{apt.service?.name}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#818cf8' }}>{apt.bookingRef}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <User size={13} /> {apt.client?.name}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Calendar size={13} /> {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span style={{ color: '#64748b', fontSize: 13, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} /> {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, background: `${statusColors[apt.status] || '#64748b'}22`, color: statusColors[apt.status] || '#64748b', textTransform: 'capitalize' }}>
                      {apt.status}
                    </span>
                    {apt.status === 'confirmed' && new Date(apt.dateTime) > new Date() && (
                      <>
                        <button onClick={() => handleComplete(apt._id)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          Complete
                        </button>
                        <button onClick={() => handleCancel(apt._id)} style={{ padding: '6px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
