import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, Shield, Clock, ArrowRight, Zap, Users, CheckCircle } from 'lucide-react';

const features = [
  { icon: Calendar, title: 'Smart Scheduling', desc: 'AI-powered calendar with real-time availability checking and conflict detection.' },
  { icon: Zap, title: 'Instant Confirmations', desc: 'Automated email confirmations and reminders sent via Nodemailer.' },
  { icon: Shield, title: 'Secure Bookings', desc: 'JWT auth, data encryption, and PCI-compliant payment processing.' },
  { icon: Clock, title: 'Buffer Management', desc: 'Intelligent buffer time between appointments prevents double-booking.' },
  { icon: Users, title: 'Group Sessions', desc: 'Support for individual and group appointments with waitlist management.' },
  { icon: Star, title: 'Reviews & Ratings', desc: 'Post-appointment feedback system with aggregated provider ratings.' }
];

const categories = [
  { name: 'Healthcare', emoji: '🏥', count: '120+ providers' },
  { name: 'Beauty & Wellness', emoji: '💆', count: '85+ providers' },
  { name: 'Fitness', emoji: '🏋️', count: '60+ providers' },
  { name: 'Education', emoji: '📚', count: '95+ providers' },
  { name: 'Legal', emoji: '⚖️', count: '40+ providers' },
  { name: 'Photography', emoji: '📷', count: '55+ providers' },
  { name: 'Home Services', emoji: '🔧', count: '70+ providers' },
  { name: 'Consulting', emoji: '💼', count: '45+ providers' }
];

const stats = [
  { value: '50K+', label: 'Happy Customers' },
  { value: '2K+', label: 'Service Providers' },
  { value: '500K+', label: 'Appointments Booked' },
  { value: '4.9★', label: 'Average Rating' }
];

export default function HomePage() {
  return (
    <div style={{ color: '#f1f5f9' }}>
      {/* Hero */}
      <section style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex', alignItems: 'center',
        background: 'radial-gradient(ellipse at 60% 0%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse at 0% 100%, rgba(139,92,246,0.1) 0%, transparent 50%)',
        padding: '80px 24px'
      }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 20, padding: '6px 16px', marginBottom: 24
              }}>
                <Zap size={14} color="#818cf8" />
                <span style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>The #1 Appointment Platform</span>
              </div>
              <h1 style={{
                fontSize: 'clamp(40px, 5vw, 64px)',
                fontFamily: 'Georgia, serif',
                fontWeight: 800,
                lineHeight: 1.1,
                marginBottom: 24,
                letterSpacing: '-2px'
              }}>
                Book Anything,<br />
                <span style={{
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>Anytime, Anywhere</span>
              </h1>
              <p style={{ fontSize: 18, color: '#94a3b8', lineHeight: 1.8, marginBottom: 40, maxWidth: 480 }}>
                Connect with thousands of service providers. Schedule appointments with real-time availability, 
                automated reminders, and seamless payment processing.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <Link to="/providers" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 32px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', textDecoration: 'none', fontSize: 16, fontWeight: 700,
                  boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
                }}>
                  Browse Services <ArrowRight size={18} />
                </Link>
                <Link to="/register?role=provider" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '16px 32px', borderRadius: 12,
                  border: '1px solid rgba(99,102,241,0.4)',
                  color: '#818cf8', textDecoration: 'none', fontSize: 16, fontWeight: 600
                }}>
                  Become a Provider
                </Link>
              </div>
              <div style={{ display: 'flex', gap: 24, marginTop: 40, flexWrap: 'wrap' }}>
                {[
                  'Free to use for clients',
                  'No hidden fees',
                  'Instant confirmation'
                ].map(item => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={16} color="#10b981" />
                    <span style={{ fontSize: 13, color: '#64748b' }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero illustration */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: 480, height: 480 }}>
                {/* Main card */}
                <div style={{
                  position: 'absolute', top: 40, left: 20, right: 20,
                  background: 'rgba(30, 41, 59, 0.9)',
                  border: '1px solid rgba(99,102,241,0.3)',
                  borderRadius: 24, padding: 24,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 16 }}>Your Calendar</span>
                    <span style={{ color: '#818cf8', fontSize: 13, fontWeight: 600 }}>April 2025</span>
                  </div>
                  {/* Mini calendar grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 20 }}>
                    {['S','M','T','W','T','F','S'].map((d, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: 11, color: '#64748b', fontWeight: 600, padding: '4px 0' }}>{d}</div>
                    ))}
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(d => (
                      <div key={d} style={{
                        textAlign: 'center', fontSize: 13, padding: '6px 2px', borderRadius: 8,
                        background: d === 15 ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : [8,12,20,25].includes(d) ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color: d === 15 ? '#fff' : [8,12,20,25].includes(d) ? '#818cf8' : '#94a3b8',
                        fontWeight: d === 15 ? 700 : 400, cursor: 'pointer'
                      }}>{d}</div>
                    ))}
                  </div>
                  {/* Upcoming appointments */}
                  {[
                    { time: '9:00 AM', service: 'Dental Checkup', color: '#6366f1' },
                    { time: '2:00 PM', service: 'Yoga Class', color: '#10b981' },
                    { time: '4:30 PM', service: 'Consultation', color: '#f59e0b' }
                  ].map((apt, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0',
                      borderBottom: i < 2 ? '1px solid rgba(99,102,241,0.08)' : 'none'
                    }}>
                      <div style={{ width: 4, height: 36, borderRadius: 4, background: apt.color, flexShrink: 0 }} />
                      <div>
                        <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600, margin: 0 }}>{apt.service}</p>
                        <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{apt.time}</p>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700 }}>
                          CONFIRMED
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Floating notification */}
                <div style={{
                  position: 'absolute', bottom: 20, right: 0,
                  background: 'rgba(16,185,129,0.9)',
                  borderRadius: 16, padding: '12px 16px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  boxShadow: '0 8px 32px rgba(16,185,129,0.3)'
                }}>
                  <CheckCircle size={18} color="#fff" />
                  <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Booking Confirmed!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px', borderTop: '1px solid rgba(99,102,241,0.1)', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          {stats.map(({ value, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 900, fontFamily: 'Georgia, serif', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{value}</div>
              <div style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2 style={{ fontSize: 44, fontFamily: 'Georgia, serif', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>
              Everything you need to <span style={{ color: '#818cf8' }}>schedule smarter</span>
            </h2>
            <p style={{ color: '#64748b', fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
              A complete appointment platform built with MERN stack, React Calendar, and Nodemailer.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 20, padding: 32,
                transition: 'all 0.3s'
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
                  border: '1px solid rgba(99,102,241,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20
                }}>
                  <Icon size={24} color="#818cf8" />
                </div>
                <h3 style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{title}</h3>
                <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '80px 24px', background: 'rgba(99,102,241,0.03)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 40, fontFamily: 'Georgia, serif', fontWeight: 800, marginBottom: 12, letterSpacing: '-1px' }}>Browse by Category</h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Find the perfect service for your needs</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {categories.map(({ name, emoji, count }) => (
              <Link key={name} to={`/providers?category=${encodeURIComponent(name)}`} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 20,
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 16, textDecoration: 'none', transition: 'all 0.3s'
              }}>
                <span style={{ fontSize: 28 }}>{emoji}</span>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>{name}</div>
                  <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{count}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 32, padding: '64px 48px'
          }}>
            <h2 style={{ fontSize: 40, fontFamily: 'Georgia, serif', fontWeight: 800, marginBottom: 16, letterSpacing: '-1px' }}>
              Ready to get started?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
              Join thousands of happy customers who book appointments through BookEase every day.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link to="/register" style={{
                padding: '14px 32px', borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 700,
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
              }}>
                Create Free Account
              </Link>
              <Link to="/providers" style={{
                padding: '14px 32px', borderRadius: 12,
                border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8', textDecoration: 'none', fontSize: 15, fontWeight: 600
              }}>
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(99,102,241,0.1)', padding: '40px 24px', textAlign: 'center' }}>
        <p style={{ color: '#334155', fontSize: 14 }}>
          © 2024 BookEase. Built with MERN Stack • React Calendar • Nodemailer • Stripe
        </p>
      </footer>
    </div>
  );
}
