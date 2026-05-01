// ProviderAvailabilityPage.js
import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Save, Plus, Trash2 } from 'lucide-react';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function ProviderAvailabilityPage() {
  const [providerId, setProviderId] = useState(null);
  const [availability, setAvailability] = useState(DAYS.map((d, i) => ({ dayOfWeek: i, startTime: '09:00', endTime: '17:00', isAvailable: i > 0 && i < 6 })));
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlock, setNewBlock] = useState({ date: '', reason: '', isFullDay: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(async ({ data }) => {
      const pp = data.data.providerProfile;
      if (pp) {
        setProviderId(pp._id);
        const { data: pd } = await api.get(`/providers/${pp._id}`);
        if (pd.data.weeklyAvailability?.length) setAvailability(pd.data.weeklyAvailability);
        if (pd.data.blockedDates?.length) setBlockedDates(pd.data.blockedDates);
      }
    });
  }, []);

  const handleSave = async () => {
    if (!providerId) return;
    setSaving(true);
    try {
      await api.patch(`/providers/${providerId}/availability`, { weeklyAvailability: availability });
      toast.success('Availability saved!');
    } catch (e) { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleBlockDate = async () => {
    if (!newBlock.date || !providerId) return;
    try {
      await api.post(`/providers/${providerId}/block-date`, newBlock);
      toast.success('Date blocked');
      setNewBlock({ date: '', reason: '', isFullDay: true });
      const { data } = await api.get(`/providers/${providerId}`);
      setBlockedDates(data.data.blockedDates || []);
    } catch (e) { toast.error('Failed to block date'); }
  };

  const handleUnblock = async (blockedId) => {
    try {
      await api.delete(`/providers/${providerId}/block-date/${blockedId}`);
      toast.success('Date unblocked');
      setBlockedDates(prev => prev.filter(b => b._id !== blockedId));
    } catch (e) { toast.error('Failed to unblock'); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 30, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 4 }}>Availability Settings</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Set when you're available for appointments</p>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        {/* Weekly schedule */}
        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28, marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Weekly Schedule</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {availability.map((slot, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', background: slot.isAvailable ? 'rgba(99,102,241,0.05)' : 'rgba(15,23,42,0.4)', borderRadius: 12, border: `1px solid ${slot.isAvailable ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.05)'}` }}>
                <input type="checkbox" checked={slot.isAvailable} onChange={e => {
                  const updated = [...availability];
                  updated[i] = { ...updated[i], isAvailable: e.target.checked };
                  setAvailability(updated);
                }} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                <span style={{ width: 100, color: slot.isAvailable ? '#f1f5f9' : '#64748b', fontWeight: 600, fontSize: 15 }}>{DAYS[i]}</span>
                {slot.isAvailable ? (
                  <>
                    <input type="time" value={slot.startTime} onChange={e => {
                      const updated = [...availability];
                      updated[i] = { ...updated[i], startTime: e.target.value };
                      setAvailability(updated);
                    }} style={{ ...inputStyle, width: 130 }} />
                    <span style={{ color: '#64748b', fontWeight: 500 }}>to</span>
                    <input type="time" value={slot.endTime} onChange={e => {
                      const updated = [...availability];
                      updated[i] = { ...updated[i], endTime: e.target.value };
                      setAvailability(updated);
                    }} style={{ ...inputStyle, width: 130 }} />
                    <span style={{ color: '#64748b', fontSize: 13 }}>
                      {(() => {
                        const [sh, sm] = slot.startTime.split(':').map(Number);
                        const [eh, em] = slot.endTime.split(':').map(Number);
                        const mins = (eh * 60 + em) - (sh * 60 + sm);
                        return `${Math.floor(mins / 60)}h ${mins % 60}m`;
                      })()}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#4b5563', fontSize: 14 }}>Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Block dates */}
        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Block Specific Dates</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 12, marginBottom: 16, alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Date</label>
              <input type="date" value={newBlock.date} onChange={e => setNewBlock(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Reason (optional)</label>
              <input value={newBlock.reason} onChange={e => setNewBlock(p => ({ ...p, reason: e.target.value }))} placeholder="Vacation, Holiday..." style={inputStyle} />
            </div>
            <button onClick={handleBlockDate} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: 'linear-gradient(135deg,#ef4444,#dc2626)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap' }}>
              <Plus size={14} /> Block
            </button>
          </div>
          {blockedDates.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {blockedDates.map(b => (
                <div key={b._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10 }}>
                  <div>
                    <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    {b.reason && <span style={{ color: '#64748b', fontSize: 13, marginLeft: 12 }}>— {b.reason}</span>}
                  </div>
                  <button onClick={() => handleUnblock(b._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
