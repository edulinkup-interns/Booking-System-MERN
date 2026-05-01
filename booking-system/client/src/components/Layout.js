import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Calendar, Home, LogOut, Menu, X, Bell, User, ChevronDown,
  LayoutDashboard, Settings, Briefcase, Clock, BarChart3,
  BookOpen, Users, Sliders
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isProvider } = useAuth();
  const { unreadCount, notifications, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/providers', label: 'Services', icon: Briefcase },
    ...(user ? [{ to: '/appointments', label: 'Appointments', icon: Calendar }] : []),
  ];

  return (
    <nav style={{
      background: 'rgba(10, 12, 20, 0.95)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
      position: 'sticky', top: 0, zIndex: 1000,
      padding: '0 24px'
    }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Calendar size={20} color="#fff" />
          </div>
          <span style={{ color: '#f1f5f9', fontWeight: 800, fontSize: 20, fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
            Book<span style={{ color: '#818cf8' }}>Ease</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} className="desktop-nav">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: isActive(to) ? '#818cf8' : '#94a3b8',
              background: isActive(to) ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              transition: 'all 0.2s'
            }}>
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <>
              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  style={{
                    position: 'relative', background: 'rgba(30, 41, 59, 0.8)',
                    border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 10,
                    width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#94a3b8'
                  }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: '#ef4444', color: '#fff', fontSize: 10,
                      borderRadius: 10, padding: '1px 5px', fontWeight: 700, minWidth: 16, textAlign: 'center'
                    }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </button>
                {notifOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 48,
                    background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 16, width: 340, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 100
                  }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(99,102,241,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#f1f5f9', fontWeight: 700 }}>Notifications</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: 12, cursor: 'pointer' }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
                          <Bell size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                          <p>No notifications</p>
                        </div>
                      ) : notifications.map(n => (
                        <div key={n._id} style={{
                          padding: '14px 20px',
                          background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.05)',
                          borderBottom: '1px solid rgba(99,102,241,0.05)',
                          borderLeft: n.isRead ? 'none' : '3px solid #6366f1'
                        }}>
                          <p style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500, margin: '0 0 4px' }}>{n.title}</p>
                          <p style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 10, padding: '6px 12px 6px 8px', cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff'
                  }}>
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 500 }}>{user.name?.split(' ')[0]}</span>
                  <ChevronDown size={14} color="#64748b" />
                </button>
                {profileOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 48,
                    background: '#1e293b', border: '1px solid rgba(99,102,241,0.2)',
                    borderRadius: 16, width: 220, boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    overflow: 'hidden', zIndex: 100
                  }}>
                    <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
                      <p style={{ color: '#f1f5f9', fontWeight: 600, margin: 0, fontSize: 14 }}>{user.name}</p>
                      <p style={{ color: '#64748b', fontSize: 12, margin: '2px 0 0' }}>{user.email}</p>
                      <span style={{
                        display: 'inline-block', marginTop: 6, padding: '2px 8px', borderRadius: 6,
                        background: user.role === 'provider' ? 'rgba(139,92,246,0.2)' : 'rgba(16,185,129,0.2)',
                        color: user.role === 'provider' ? '#a78bfa' : '#34d399', fontSize: 11, fontWeight: 600
                      }}>{user.role}</span>
                    </div>
                    {[
                      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                      { to: '/profile', label: 'Profile', icon: User },
                      ...(isProvider ? [{ to: '/provider/dashboard', label: 'Provider Portal', icon: Briefcase }] : [])
                    ].map(({ to, label, icon: Icon }) => (
                      <Link key={to} to={to} onClick={() => setProfileOpen(false)} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                        textDecoration: 'none', color: '#94a3b8', fontSize: 14,
                        borderBottom: '1px solid rgba(99,102,241,0.05)', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.background = 'rgba(99,102,241,0.05)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Icon size={16} />
                        {label}
                      </Link>
                    ))}
                    <button onClick={handleLogout} style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                      width: '100%', background: 'none', border: 'none', color: '#ef4444',
                      fontSize: 14, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" style={{
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                color: '#94a3b8', fontSize: 14, fontWeight: 500,
                border: '1px solid rgba(99,102,241,0.2)', transition: 'all 0.2s'
              }}>Log in</Link>
              <Link to="/register" style={{
                padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontSize: 14, fontWeight: 600
              }}>Sign up</Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
              display: 'none'
            }}
            className="mobile-menu-btn"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div style={{
          background: '#0f172a', borderTop: '1px solid rgba(99,102,241,0.1)',
          padding: '16px 24px 24px'
        }}>
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} onClick={() => setMobileOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0',
              textDecoration: 'none', color: '#94a3b8', fontSize: 15,
              borderBottom: '1px solid rgba(99,102,241,0.05)'
            }}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

const Layout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14' }}>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
