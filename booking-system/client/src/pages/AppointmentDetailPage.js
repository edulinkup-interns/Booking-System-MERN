import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ArrowLeft, Calendar, Clock, MapPin, Star, RotateCcw, XCircle, CheckCircle } from 'lucide-react';

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [apt, setApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescheduling, setRescheduling] = useState(false);
  const [newDate, setNewDate] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  useEffect(() => {
    api.get(`/appointments/${id}`).then(({ data }) => setApt(data.data)).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      navigate('/appointments');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to cancel'); }
  };

  const handleReschedule = async () => {
    if (!newDate) return toast.error('Select a new date/time');
    try {
      await api.patch(`/appointments/${id}/reschedule`, { dateTime: newDate });
      toast.success('Rescheduled successfully!');
      setRescheduling(false);
      const { data } = await api.get(`/appointments/${id}`);
      setApt(data.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to reschedule'); }
  };

  const handleRating = async () => {
    if (!rating) return toast.error('Select a rating');
    setSubmittingRating(true);
    try {
      await api.post(`/appointments/${id}/rate`, { score: rating, comment });
      toast.success('Review submitted!');
      const { data } = await api.get(`/appointments/${id}`);
      setApt(data.data);
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to submit review'); }
    finally { setSubmittingRating(false); }
  };

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>;
  if (!apt) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Appointment not found</div>;

  const dt = new Date(apt.dateTime);
  const isPast = dt < new Date();
  const canCancel = !isPast && ['pending', 'confirmed'].includes(apt.status);
  const canReschedule = !isPast && ['pending', 'confirmed'].includes(apt.status);
  const canRate = isPast && apt.status === 'completed' && !apt.rating?.score;

  const statusColors = { confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1', 'no-show': '#6b7280' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => navigate('/appointments')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: 24, fontSize: 14 }}>
          <ArrowLeft size={16} /> Back to Appointments
        </button>

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '28px 28px 24px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px', fontFamily: 'Georgia,serif' }}>{apt.service?.name}</h1>
                <span style={{ fontFamily: 'monospace', fontSize: 14, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '3px 10px', borderRadius: 8 }}>{apt.bookingRef}</span>
              </div>
              <span style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700,
                background: `${statusColors[apt.status]}22`, color: statusColors[apt.status] || '#64748b', textTransform: 'capitalize'
              }}>{apt.status}</span>
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: '24px 28px' }}>
            {[
              { icon: Calendar, label: 'Date', value: dt.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
              { icon: Clock, label: 'Time', value: `${dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (${apt.service?.duration} min)` },
              { icon: MapPin, label: 'Provider', value: apt.provider?.businessName || apt.provider?.user?.name }
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                <Icon size={18} color="#64748b" />
                <span style={{ color: '#64748b', fontSize: 14, width: 80, flexShrink: 0 }}>{label}</span>
                <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 500 }}>{value}</span>
              </div>
            ))}

            {apt.notes?.client && (
              <div style={{ marginTop: 20, padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 12 }}>
                <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 1 }}>Your Notes</p>
                <p style={{ color: '#94a3b8', fontSize: 14, margin: 0, lineHeight: 1.6 }}>{apt.notes.client}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {(canCancel || canReschedule) && (
            <div style={{ padding: '0 28px 24px', display: 'flex', gap: 10 }}>
              {canReschedule && (
                <button onClick={() => setRescheduling(!rescheduling)} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                  color: '#818cf8', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>
                  <RotateCcw size={15} /> Reschedule
                </button>
              )}
              {canCancel && (
                <button onClick={handleCancel} style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)',
                  color: '#ef4444', fontSize: 14, fontWeight: 600, cursor: 'pointer'
                }}>
                  <XCircle size={15} /> Cancel
                </button>
              )}
            </div>
          )}

          {/* Reschedule form */}
          {rescheduling && (
            <div style={{ margin: '0 28px 24px', padding: 20, background: 'rgba(99,102,241,0.05)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15 }}>Select new date & time</h4>
              <input type="datetime-local" value={newDate} onChange={e => setNewDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }}
              />
              <button onClick={handleReschedule} style={{ padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                Confirm Reschedule
              </button>
            </div>
          )}

          {/* Rating */}
          {canRate && (
            <div style={{ margin: '0 28px 28px', padding: 20, background: 'rgba(251,191,36,0.05)', borderRadius: 12, border: '1px solid rgba(251,191,36,0.2)' }}>
              <h4 style={{ margin: '0 0 12px', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Star size={16} color="#fbbf24" /> Rate your experience
              </h4>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {[1,2,3,4,5].map(s => (
                  <button key={s} onClick={() => setRating(s)} style={{
                    width: 36, height: 36, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 18,
                    background: s <= rating ? 'rgba(251,191,36,0.2)' : 'rgba(30,41,59,0.6)'
                  }}>⭐</button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)..."
                rows={3} style={{ width: '100%', padding: '10px 12px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, color: '#f1f5f9', fontSize: 14, resize: 'vertical', marginBottom: 12, fontFamily: 'inherit', boxSizing: 'border-box' }}
              />
              <button onClick={handleRating} disabled={submittingRating} style={{ padding: '10px 20px', borderRadius: 8, background: 'linear-gradient(135deg,#f59e0b,#fbbf24)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
                {submittingRating ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}

          {apt.rating?.score && (
            <div style={{ margin: '0 28px 28px', padding: 16, background: 'rgba(99,102,241,0.05)', borderRadius: 12 }}>
              <p style={{ color: '#64748b', fontSize: 12, fontWeight: 700, margin: '0 0 6px' }}>YOUR REVIEW</p>
              <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                {Array.from({ length: apt.rating.score }).map((_, i) => <span key={i}>⭐</span>)}
              </div>
              {apt.rating.comment && <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>{apt.rating.comment}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
