import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { Search, Star, MapPin, Clock, Filter, ChevronRight } from 'lucide-react';

const CATEGORIES = ['All', 'Healthcare', 'Beauty & Wellness', 'Fitness', 'Education & Tutoring', 'Legal', 'Financial', 'Consulting', 'Home Services', 'Photography', 'Events', 'Pet Services', 'Technology', 'Other'];

export default function ProvidersPage() {
  const [params, setParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(params.get('category') || 'All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams({ page, limit: 12 });
        if (category !== 'All') q.set('category', category);
        if (search) q.set('search', search);
        const { data } = await api.get(`/providers?${q}`);
        setProviders(data.data.providers);
        setTotalPages(data.data.pages);
      } catch (e) {
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, [category, search, page]);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 40, fontFamily: 'Georgia, serif', fontWeight: 800, marginBottom: 12, letterSpacing: '-1px' }}>Browse Services</h1>
          <p style={{ color: '#64748b', fontSize: 16 }}>Find and book with top-rated service providers</p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 24, maxWidth: 500 }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text" placeholder="Search providers..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', padding: '13px 16px 13px 48px',
              background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 12, color: '#f1f5f9', fontSize: 15, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setCategory(cat); setPage(1); }} style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
              background: category === cat ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
              border: `1px solid ${category === cat ? 'transparent' : 'rgba(99,102,241,0.2)'}`,
              color: category === cat ? '#fff' : '#94a3b8', cursor: 'pointer', transition: 'all 0.2s'
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ height: 280, background: 'rgba(30,41,59,0.4)', borderRadius: 20, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#64748b', fontSize: 18 }}>No providers found. Try a different search.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 20 }}>
            {providers.map(provider => (
              <ProviderCard key={provider._id} provider={provider} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: 40, height: 40, borderRadius: 10, border: 'none',
                background: p === page ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.6)',
                color: '#fff', cursor: 'pointer', fontWeight: 600
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider }) {
  const services = provider.services?.filter(s => s.isActive) || [];
  const minPrice = services.length ? Math.min(...services.map(s => s.price?.amount || 0)) : null;

  return (
    <Link to={`/providers/${provider._id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)',
        borderRadius: 20, overflow: 'hidden', transition: 'all 0.3s', cursor: 'pointer'
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.15)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.15)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        {/* Header gradient */}
        <div style={{ height: 100, background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.2))', position: 'relative' }}>
          <div style={{
            position: 'absolute', bottom: -28, left: 24,
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, border: '3px solid #0a0c14', fontWeight: 700, color: '#fff'
          }}>
            {provider.businessName?.charAt(0)}
          </div>
          <div style={{ position: 'absolute', top: 12, right: 16, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '4px 8px' }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>{provider.rating?.average?.toFixed(1) || '—'}</span>
            {provider.rating?.count > 0 && <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>({provider.rating.count})</span>}
          </div>
        </div>

        <div style={{ padding: '40px 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <h3 style={{ color: '#f1f5f9', fontSize: 17, fontWeight: 700, margin: 0 }}>{provider.businessName}</h3>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontWeight: 700, flexShrink: 0, marginLeft: 8 }}>
              {provider.category}
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {provider.bio || 'Professional service provider'}
          </p>

          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            {provider.location?.city && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={13} color="#64748b" />
                <span style={{ color: '#64748b', fontSize: 12 }}>{provider.location.city}</span>
              </div>
            )}
            {services.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={13} color="#64748b" />
                <span style={{ color: '#64748b', fontSize: 12 }}>{services.length} service{services.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#10b981', fontSize: 14, fontWeight: 700 }}>
              {minPrice !== null ? (minPrice === 0 ? 'Free' : `From $${minPrice}`) : 'Contact for pricing'}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#818cf8', fontSize: 13, fontWeight: 600 }}>
              Book now <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
