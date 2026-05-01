// DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, Clock, CheckCircle, ArrowRight, Bell } from 'lucide-react';

export default function DashboardPage() {
  const { user, isProvider } = useAuth();
  const [upcoming, setUpcoming] = useState([]);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/appointments?limit=5');
        const apts = data.data.appointments || [];
        setUpcoming(apts.slice(0, 3));
        setStats({
          total: data.data.total,
          upcoming: apts.filter(a => ['confirmed', 'pending'].includes(a.status) && new Date(a.dateTime) > new Date()).length,
          completed: apts.filter(a => a.status === 'completed').length
        });
      } catch (e) {}
    };
    fetchData();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 36, fontFamily: 'Georgia,serif', fontWeight: 800, marginBottom: 8, letterSpacing: '-1px' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span style={{ background: 'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {user?.name?.split(' ')[0]}
            </span>
          </h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Here's your appointment overview</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 40 }}>
          {[
            { label: 'Total Bookings', value: stats.total, icon: Calendar, color: '#6366f1' },
            { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: '#f59e0b' },
            { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10b981' }
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{
              background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 20, padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 20
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={24} color={color} />
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#f1f5f9', fontFamily: 'Georgia,serif' }}>{value}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
          {/* Upcoming */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Upcoming Appointments</h2>
              <Link to="/appointments" style={{ color: '#818cf8', textDecoration: 'none', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={13} />
              </Link>
            </div>
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <Calendar size={36} style={{ color: '#374151', margin: '0 auto 12px', display: 'block' }} />
                <p style={{ color: '#64748b', fontSize: 14 }}>No upcoming appointments</p>
                <Link to="/providers" style={{ color: '#818cf8', textDecoration: 'none', fontSize: 13 }}>Browse services →</Link>
              </div>
            ) : upcoming.map(apt => (
              <div key={apt._id} style={{ display: 'flex', gap: 16, padding: '16px 0', borderBottom: '1px solid rgba(99,102,241,0.08)' }}>
                <div style={{ width: 4, height: 52, borderRadius: 4, background: apt.service?.color || '#6366f1', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>{apt.service?.name}</div>
                  <div style={{ color: '#64748b', fontSize: 13 }}>
                    {new Date(apt.dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                    {new Date(apt.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: apt.status === 'confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', color: apt.status === 'confirmed' ? '#10b981' : '#f59e0b', fontWeight: 700, alignSelf: 'center' }}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>Quick Actions</h3>
              {[
                { to: '/providers', label: 'Book Appointment', emoji: '📅' },
                { to: '/appointments', label: 'My Appointments', emoji: '📋' },
                { to: '/profile', label: 'Edit Profile', emoji: '👤' },
                ...(isProvider ? [{ to: '/provider/dashboard', label: 'Provider Portal', emoji: '🏢' }] : [])
              ].map(({ to, label, emoji }) => (
                <Link key={to} to={to} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0',
                  borderBottom: '1px solid rgba(99,102,241,0.06)', textDecoration: 'none',
                  color: '#94a3b8', fontSize: 14, transition: 'color 0.2s'
                }}>
                  <span style={{ fontSize: 18 }}>{emoji}</span>
                  <span>{label}</span>
                  <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
