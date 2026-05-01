import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { BarChart3, Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, Star, ArrowRight, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function ProviderDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/provider').then(({ data }) => setAnalytics(data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading analytics...</div>;

  const overview = analytics?.overview || {};
  const weeklyTrend = analytics?.weeklyTrend || [];
  const statusBreakdown = analytics?.statusBreakdown || [];
  const topServices = analytics?.topServices || [];

  const statusColors = { confirmed: '#10b981', pending: '#f59e0b', cancelled: '#ef4444', completed: '#6366f1', 'no-show': '#6b7280' };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 4, letterSpacing: '-0.5px' }}>Provider Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: 15 }}>Last 30 days performance</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/provider/services" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>
              <Plus size={16} /> Add Service
            </Link>
            <Link to="/provider/appointments" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>
              View Appointments
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 32 }}>
          {[
            { label: 'Total Appointments', value: overview.totalAppointments || 0, icon: Calendar, color: '#6366f1' },
            { label: 'Revenue', value: `$${(overview.revenue || 0).toFixed(0)}`, icon: DollarSign, color: '#10b981' },
            { label: 'Avg Rating', value: overview.avgRating ? `${overview.avgRating.toFixed(1)}★` : 'N/A', icon: Star, color: '#f59e0b' },
            { label: 'Total Reviews', value: overview.ratingCount || 0, icon: Users, color: '#8b5cf6' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Georgia,serif' }}>{value}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Chart */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Appointment Trend</h3>
            {weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyTrend.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.1)" />
                  <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChart3 size={40} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                  <p>No data yet</p>
                </div>
              </div>
            )}
          </div>

          {/* Status breakdown */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Status Breakdown</h3>
            {statusBreakdown.map(({ _id, count }) => (
              <div key={_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: statusColors[_id] || '#64748b' }} />
                  <span style={{ color: '#94a3b8', fontSize: 13, textTransform: 'capitalize' }}>{_id}</span>
                </div>
                <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>{count}</span>
              </div>
            ))}
            {statusBreakdown.length === 0 && <p style={{ color: '#64748b', fontSize: 14 }}>No appointments yet</p>}
          </div>
        </div>

        {/* Top services */}
        {topServices.length > 0 && (
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Top Services</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {topServices.map(({ service, count }) => (
                <div key={service._id} style={{ padding: '16px 20px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 12 }}>
                  <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14, margin: '0 0 4px' }}>{service.name}</p>
                  <p style={{ color: '#818cf8', fontSize: 20, fontWeight: 800, margin: 0 }}>{count}</p>
                  <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>bookings</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick nav */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 24 }}>
          {[
            { to: '/provider/appointments', label: 'Appointments', icon: Calendar, desc: 'Manage bookings' },
            { to: '/provider/services', label: 'Services', icon: Plus, desc: 'Add/edit services' },
            { to: '/provider/availability', label: 'Availability', icon: Clock, desc: 'Set your hours' },
            { to: '/provider/analytics', label: 'Analytics', icon: BarChart3, desc: 'Deep insights' }
          ].map(({ to, label, icon: Icon, desc }) => (
            <Link key={to} to={to} style={{
              display: 'flex', flexDirection: 'column', gap: 8, padding: 20,
              background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(99,102,241,0.1)',
              borderRadius: 16, textDecoration: 'none', transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.1)'; e.currentTarget.style.background = 'rgba(30,41,59,0.5)'; }}
            >
              <Icon size={20} color="#818cf8" />
              <div>
                <p style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, margin: 0 }}>{label}</p>
                <p style={{ color: '#64748b', fontSize: 12, margin: 0 }}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
