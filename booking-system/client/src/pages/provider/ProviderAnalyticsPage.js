import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Star } from 'lucide-react';

export default function ProviderAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(30);

  useEffect(() => {
    const end = new Date();
    const start = new Date(end.getTime() - range * 24 * 60 * 60 * 1000);
    api.get(`/analytics/provider?startDate=${start.toISOString()}&endDate=${end.toISOString()}`)
      .then(({ data: d }) => setData(d.data))
      .finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading analytics...</div>;

  const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 30, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 4 }}>Analytics</h1>
            <p style={{ color: '#64748b', fontSize: 14 }}>Performance insights for your business</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[7,30,90].map(d => (
              <button key={d} onClick={() => setRange(d)} style={{
                padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600,
                background: range === d ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
                color: '#fff', cursor: 'pointer'
              }}>Last {d}d</button>
            ))}
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Total Appointments', value: data?.overview?.totalAppointments || 0, icon: Calendar, color: '#6366f1', prefix: '' },
            { label: 'Revenue', value: (data?.overview?.revenue || 0).toFixed(2), icon: DollarSign, color: '#10b981', prefix: '$' },
            { label: 'Avg Rating', value: data?.overview?.avgRating?.toFixed(1) || 'N/A', icon: Star, color: '#f59e0b', prefix: '' },
            { label: 'Reviews', value: data?.overview?.ratingCount || 0, icon: TrendingUp, color: '#8b5cf6', prefix: '' }
          ].map(({ label, value, icon: Icon, color, prefix }) => (
            <div key={label} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Georgia,serif' }}>{prefix}{value}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Trend chart */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Daily Appointments</h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data?.weeklyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => v?.slice(5) || ''} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Status pie */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Status Split</h3>
            {data?.statusBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.statusBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={65} paddingAngle={3}>
                    {data.statusBreakdown.map((entry, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151' }}>No data</div>}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {data?.statusBreakdown?.map((s, i) => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: '#64748b', fontSize: 12, textTransform: 'capitalize' }}>{s._id} ({s.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hourly heatmap */}
        {data?.hourlyDistribution?.length > 0 && (
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Popular Booking Hours</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={data.hourlyDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,102,241,0.08)" />
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={h => `${h}:00`} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, color: '#f1f5f9' }} formatter={(v) => [v, 'Bookings']} labelFormatter={h => `${h}:00`} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top services */}
        {data?.topServices?.length > 0 && (
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Top Services</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.topServices.map(({ service, count }, i) => {
                const max = data.topServices[0]?.count || 1;
                return (
                  <div key={service._id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ width: 24, color: '#64748b', fontSize: 14, fontWeight: 700 }}>#{i + 1}</span>
                    <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600, minWidth: 160 }}>{service.name}</span>
                    <div style={{ flex: 1, height: 8, background: 'rgba(99,102,241,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderRadius: 4 }} />
                    </div>
                    <span style={{ color: '#818cf8', fontWeight: 700, fontSize: 15 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
