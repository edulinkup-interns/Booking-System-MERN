import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Clock, DollarSign } from 'lucide-react';

const defaultService = { name: '', description: '', duration: 60, price: { amount: 0, currency: 'USD', type: 'fixed' }, color: '#6366f1', requiresApproval: false, allowRecurring: false, maxParticipants: 1 };
const COLORS = ['#6366f1','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16'];

export default function ProviderServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(defaultService);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const profile = await api.get('/auth/me');
        const pp = profile.data.data.providerProfile;
        if (pp) {
          const { data } = await api.get(`/services?providerId=${pp._id}`);
          setServices(data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);
  
  const fetchServices = async () => {
    const profile = await api.get('/auth/me');
    const pp = profile.data.data.providerProfile;
    if (pp) {
      const { data } = await api.get(`/services?providerId=${pp._id}`);
      setServices(data.data);
    }
  };

  const handleSave = async () => {
    try {
      if (editId) await api.put(`/services/${editId}`, form);
      else await api.post('/services', form);
      toast.success(editId ? 'Service updated!' : 'Service created!');
      setShowForm(false);
      setEditId(null);
      setForm(defaultService);
      fetchServices();
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save service'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service deactivated');
      fetchServices();
    } catch (e) { toast.error('Failed to deactivate'); }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, color: '#f1f5f9', fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 30, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 4 }}>Your Services</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Create and manage the services you offer</p>
          </div>
          <button onClick={() => { setForm(defaultService); setEditId(null); setShowForm(true); }} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14
          }}>
            <Plus size={16} /> Add Service
          </button>
        </div>

        {/* Services grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 180, background: 'rgba(30,41,59,0.4)', borderRadius: 16 }} />)}
          </div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🛠️</div>
            <h3 style={{ color: '#64748b', marginBottom: 8 }}>No services yet</h3>
            <p style={{ color: '#4b5563', fontSize: 14 }}>Add your first service to start accepting bookings</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
            {services.map(svc => (
              <div key={svc._id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ height: 6, background: svc.color || '#6366f1' }} />
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <h3 style={{ color: '#f1f5f9', fontSize: 16, fontWeight: 700, margin: 0 }}>{svc.name}</h3>
                    <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>ACTIVE</span>
                  </div>
                  {svc.description && <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px', lineHeight: 1.5 }}>{svc.description}</p>}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={13} color="#64748b" />
                      <span style={{ color: '#94a3b8', fontSize: 13 }}>{svc.duration} min</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <DollarSign size={13} color="#64748b" />
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: 13 }}>
                        {svc.price?.amount === 0 ? 'Free' : `$${svc.price?.amount}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setForm({ ...svc, price: svc.price || { amount: 0 } }); setEditId(svc._id); setShowForm(true); }} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8,
                      background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', cursor: 'pointer', fontSize: 13
                    }}>
                      <Edit size={13} /> Edit
                    </button>
                    <button onClick={() => handleDelete(svc._id)} style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', fontSize: 13
                    }}>
                      <Trash2 size={13} /> Deactivate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Form Modal */}
        {showForm && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <div style={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 24, padding: 32, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{editId ? 'Edit Service' : 'New Service'}</h2>
                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {[['name','Service Name','text','e.g. Deep Tissue Massage'],['description','Description (optional)','text','Brief description of the service']].map(([k,l,t,p]) => (
                <div key={k} style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{l}</label>
                  {k === 'description' ? (
                    <textarea value={form[k] || ''} onChange={e => setForm(p2 => ({ ...p2, [k]: e.target.value }))} placeholder={p} rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                  ) : (
                    <input type={t} value={form[k] || ''} onChange={e => setForm(p2 => ({ ...p2, [k]: e.target.value }))} placeholder={p} style={inputStyle} />
                  )}
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Duration (min)</label>
                  <input type="number" min={5} max={480} value={form.duration} onChange={e => setForm(p => ({ ...p, duration: parseInt(e.target.value) }))} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Price ($)</label>
                  <input type="number" min={0} step={0.01} value={form.price?.amount || 0}
                    onChange={e => setForm(p => ({ ...p, price: { ...p.price, amount: parseFloat(e.target.value) } }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Color</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: `3px solid ${form.color === c ? '#fff' : 'transparent'}`, cursor: 'pointer'
                    }} />
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                {[['requiresApproval','Requires Approval'],['allowRecurring','Allow Recurring']].map(([k,l]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form[k] || false} onChange={e => setForm(p => ({ ...p, [k]: e.target.checked }))} />
                    <span style={{ color: '#94a3b8', fontSize: 13 }}>{l}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setShowForm(false)} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid rgba(99,102,241,0.3)', background: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleSave} style={{ flex: 2, padding: 12, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
                  {editId ? 'Update Service' : 'Create Service'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
