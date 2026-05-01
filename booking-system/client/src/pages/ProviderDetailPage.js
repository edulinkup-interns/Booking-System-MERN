import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { Star, MapPin, Clock, Calendar, ChevronRight, Phone, Globe } from 'lucide-react';

export default function ProviderDetailPage() {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/providers/${id}`).then(({ data }) => setProvider(data.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading...</div>;
  if (!provider) return <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Provider not found</div>;

  const services = provider.services || [];
  const daysMap = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', color: '#f1f5f9' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.1))', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '48px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', gap: 32, alignItems: 'flex-start' }}>
          <div style={{ width: 96, height: 96, borderRadius: 24, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
            {provider.businessName?.charAt(0)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <h1 style={{ fontSize: 32, fontFamily: 'Georgia,serif', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{provider.businessName}</h1>
              {provider.isVerified && <span style={{ background: 'rgba(16,185,129,0.2)', color: '#10b981', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>✓ Verified</span>}
            </div>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', fontSize: 13, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>{provider.category}</span>
              {provider.rating?.count > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Star size={16} color="#fbbf24" fill="#fbbf24" />
                  <span style={{ fontWeight: 700 }}>{provider.rating.average.toFixed(1)}</span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>({provider.rating.count} reviews)</span>
                </div>
              )}
              {provider.location?.city && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#64748b' }}>
                  <MapPin size={14} />
                  <span style={{ fontSize: 13 }}>{provider.location.city}{provider.location.state ? `, ${provider.location.state}` : ''}</span>
                </div>
              )}
            </div>
            {provider.bio && <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.7, maxWidth: 600, margin: 0 }}>{provider.bio}</p>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32 }}>
        {/* Services */}
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>Services</h2>
          {services.length === 0 ? (
            <p style={{ color: '#64748b' }}>No services available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {services.map(service => (
                <div key={service._id} style={{
                  background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)',
                  borderRadius: 16, padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: service.color || '#6366f1' }} />
                      <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{service.name}</h3>
                    </div>
                    {service.description && <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 10px', lineHeight: 1.5 }}>{service.description}</p>}
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={13} color="#64748b" />
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>{service.duration} min</span>
                      </div>
                      <span style={{ color: '#10b981', fontWeight: 700, fontSize: 15 }}>
                        {service.price?.amount === 0 ? 'Free' : `$${service.price?.amount}`}
                      </span>
                    </div>
                  </div>
                  <Link to={`/book/${service._id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10,
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', textDecoration: 'none', fontSize: 14, fontWeight: 700, flexShrink: 0, marginLeft: 20
                  }}>
                    Book <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Availability */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={16} color="#818cf8" /> Availability
            </h3>
            {provider.weeklyAvailability?.filter(s => s.isAvailable).map(slot => (
              <div key={slot.dayOfWeek} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(99,102,241,0.06)' }}>
                <span style={{ color: '#94a3b8', fontSize: 13 }}>{daysMap[slot.dayOfWeek]}</span>
                <span style={{ color: '#64748b', fontSize: 13 }}>{slot.startTime} – {slot.endTime}</span>
              </div>
            ))}
            {provider.bufferTime > 0 && <p style={{ color: '#64748b', fontSize: 12, marginTop: 12 }}>⏱ {provider.bufferTime} min buffer between appointments</p>}
          </div>

          {/* Contact */}
          {(provider.contactInfo?.phone || provider.contactInfo?.website) && (
            <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Contact</h3>
              {provider.contactInfo?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <Phone size={14} color="#64748b" />
                  <span style={{ color: '#94a3b8', fontSize: 14 }}>{provider.contactInfo.phone}</span>
                </div>
              )}
              {provider.contactInfo?.website && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Globe size={14} color="#64748b" />
                  <a href={provider.contactInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', fontSize: 14, textDecoration: 'none' }}>Website</a>
                </div>
              )}
            </div>
          )}

          {/* Cancellation */}
          {provider.cancellationPolicy && (
            <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 20, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Cancellation Policy</h3>
              <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {provider.cancellationPolicy.description || `Free cancellation up to ${provider.cancellationPolicy.hoursBeforeNoFee} hours before appointment.`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
