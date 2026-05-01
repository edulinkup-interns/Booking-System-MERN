import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { Calendar, Clock, CheckCircle, XCircle, RotateCcw, AlertCircle, ChevronRight, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: AlertCircle, label: 'Pending' },
  confirmed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle, label: 'Confirmed' },
  cancelled: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle, label: 'Cancelled' },
  completed: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: CheckCircle, label: 'Completed' },
  rescheduled: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: RotateCcw, label: 'Rescheduled' },
  'no-show': { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: XCircle, label: 'No Show' }
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: 10 });
      if (filter !== 'all') q.set('status', filter);
      const { data } = await api.get(`/appointments?${q}`);
      setAppointments(data.data.appointments);
      setTotalPages(data.data.pages || 1);
    } catch (e) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter, page]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to cancel');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>My Appointments</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>Manage your upcoming and past bookings</p>
          </div>
          <Link to="/providers" style={{
            padding: '10px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700
          }}>
            + New Booking
          </Link>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(f => (
            <button key={f} onClick={() => { setFilter(f); setPage(1); }} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: 'none',
              background: filter === f ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
              color: '#fff', cursor: 'pointer', textTransform: 'capitalize'
            }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ height: 100, background: 'rgba(30,41,59,0.4)', borderRadius: 16 }} />
            ))}
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Calendar size={48} style={{ color: '#374151', margin: '0 auto 16px', display: 'block' }} />
            <h3 style={{ color: '#64748b', fontSize: 18, marginBottom: 8 }}>No appointments found</h3>
            <Link to="/providers" style={{ color: '#818cf8', textDecoration: 'none', fontSize: 14 }}>Browse services to book one →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {appointments.map(apt => {
              const status = STATUS_CONFIG[apt.status] || STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              const dt = new Date(apt.dateTime);
              const isPast = dt < new Date();
              return (
                <div key={apt._id} style={{
                  background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 16, padding: '20px 24px',
                  display: 'flex', alignItems: 'center', gap: 20, transition: 'all 0.2s'
                }}>
                  {/* Color bar */}
                  <div style={{ width: 4, height: 60, borderRadius: 4, background: apt.service?.color || '#6366f1', flexShrink: 0 }} />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0 }}>{apt.service?.name || 'Service'}</h3>
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20,
                        background: status.bg, color: status.color, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 8
                      }}>
                        <StatusIcon size={12} />
                        {status.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Calendar size={13} color="#64748b" />
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>
                          {dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={13} color="#64748b" />
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>
                          {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {apt.service?.duration} min
                        </span>
                      </div>
                    </div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ color: '#64748b', fontSize: 12, fontFamily: 'monospace' }}>{apt.bookingRef}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {!isPast && ['pending','confirmed'].includes(apt.status) && (
                      <button onClick={() => handleCancel(apt._id)} style={{
                        padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.05)', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                      }}>
                        Cancel
                      </button>
                    )}
                    <Link to={`/appointments/${apt._id}`} style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(99,102,241,0.3)',
                      color: '#818cf8', textDecoration: 'none', fontSize: 12, fontWeight: 600
                    }}>
                      Details <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 36, height: 36, borderRadius: 8, border: 'none',
                background: p === page ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
                color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
