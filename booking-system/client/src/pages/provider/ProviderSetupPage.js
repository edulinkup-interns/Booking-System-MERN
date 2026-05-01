// Provider Setup Page
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Healthcare','Beauty & Wellness','Fitness','Education & Tutoring','Legal','Financial','Consulting','Home Services','Photography','Events','Pet Services','Technology','Other'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

export default function ProviderSetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    businessName: '', category: '', bio: '',
    location: { address: '', city: '', state: '', country: '', zipCode: '' },
    contactInfo: { phone: '', website: '' },
    bufferTime: 15, minimumBookingLeadTime: 1, maximumBookingAdvanceDays: 90,
    weeklyAvailability: DAYS.map((d, i) => ({
      dayOfWeek: i, startTime: '09:00', endTime: '17:00', isAvailable: i > 0 && i < 6
    })),
    cancellationPolicy: { hoursBeforeNoFee: 24, description: 'Free cancellation up to 24 hours before appointment.' }
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.post('/providers', form);
      toast.success('Provider profile created!');
      navigate('/provider/dashboard');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create profile');
    } finally { setLoading(false); }
  };

  const inputStyle = { width: '100%', padding: '11px 14px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 8 }}>Set Up Your Provider Profile</h1>
          <p style={{ color: '#64748b', fontSize: 15 }}>Step {step} of 3</p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ width: 80, height: 4, borderRadius: 4, background: s <= step ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(99,102,241,0.2)' }} />
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 24, padding: 32 }}>
          {step === 1 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Business Information</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Business Name *</label>
                <input value={form.businessName} onChange={e => setForm(p => ({ ...p, businessName: e.target.value }))} placeholder="Your Business Name" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ ...inputStyle, appearance: 'none' }}>
                  <option value="">Select a category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Bio</label>
                <textarea value={form.bio} onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} placeholder="Describe your services..." rows={4}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['city','City'],['state','State'],['country','Country'],['zipCode','Zip Code']].map(([k,l]) => (
                  <div key={k}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{l}</label>
                    <input value={form.location[k]} onChange={e => setForm(p => ({ ...p, location: { ...p.location, [k]: e.target.value } }))} placeholder={l} style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Set Your Availability</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {form.weeklyAvailability.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(15,23,42,0.5)', borderRadius: 12, border: `1px solid ${slot.isAvailable ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.05)'}` }}>
                    <input type="checkbox" checked={slot.isAvailable} onChange={e => {
                      const updated = [...form.weeklyAvailability];
                      updated[i] = { ...updated[i], isAvailable: e.target.checked };
                      setForm(p => ({ ...p, weeklyAvailability: updated }));
                    }} />
                    <span style={{ width: 36, color: slot.isAvailable ? '#f1f5f9' : '#64748b', fontWeight: 600, fontSize: 14 }}>{DAYS[i]}</span>
                    {slot.isAvailable && (
                      <>
                        <input type="time" value={slot.startTime} onChange={e => {
                          const updated = [...form.weeklyAvailability];
                          updated[i] = { ...updated[i], startTime: e.target.value };
                          setForm(p => ({ ...p, weeklyAvailability: updated }));
                        }} style={{ ...inputStyle, width: 120 }} />
                        <span style={{ color: '#64748b' }}>to</span>
                        <input type="time" value={slot.endTime} onChange={e => {
                          const updated = [...form.weeklyAvailability];
                          updated[i] = { ...updated[i], endTime: e.target.value };
                          setForm(p => ({ ...p, weeklyAvailability: updated }));
                        }} style={{ ...inputStyle, width: 120 }} />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[
                  { key: 'bufferTime', label: 'Buffer (min)', min: 0, max: 120 },
                  { key: 'minimumBookingLeadTime', label: 'Min Lead (hrs)', min: 0, max: 72 },
                  { key: 'maximumBookingAdvanceDays', label: 'Max Advance (days)', min: 1, max: 365 }
                ].map(({ key, label, min, max }) => (
                  <div key={key}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{label}</label>
                    <input type="number" min={min} max={max} value={form[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: parseInt(e.target.value) }))}
                      style={inputStyle} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Cancellation Policy</h2>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Free Cancellation Window (hours before)</label>
                <input type="number" min={0} value={form.cancellationPolicy.hoursBeforeNoFee}
                  onChange={e => setForm(p => ({ ...p, cancellationPolicy: { ...p.cancellationPolicy, hoursBeforeNoFee: parseInt(e.target.value) } }))}
                  style={inputStyle} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Policy Description</label>
                <textarea value={form.cancellationPolicy.description}
                  onChange={e => setForm(p => ({ ...p, cancellationPolicy: { ...p.cancellationPolicy, description: e.target.value } }))}
                  rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              </div>
              <div style={{ padding: 20, background: 'rgba(99,102,241,0.05)', borderRadius: 12, marginBottom: 8 }}>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.7, margin: 0 }}>
                  <strong style={{ color: '#94a3b8' }}>Note:</strong> After creating your provider profile, you can add services from the Provider Dashboard. Clients will be able to search for and book your services.
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
            {step > 1 ? (
              <button onClick={() => setStep(s => s - 1)} style={{ padding: '12px 24px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Back</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={() => {
                if (step === 1 && (!form.businessName || !form.category)) return toast.error('Business name and category required');
                setStep(s => s + 1);
              }} style={{ padding: '12px 28px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                Next →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 28px', borderRadius: 10, background: loading ? '#374151' : 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
                {loading ? 'Creating...' : '🚀 Launch Profile'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
