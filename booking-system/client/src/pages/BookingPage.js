import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle, ArrowLeft, Calendar as CalIcon, Repeat } from 'lucide-react';
import toast from 'react-hot-toast';
 
export default function BookingPage() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [provider, setProvider] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [notes, setNotes] = useState('');
  const [recurring, setRecurring] = useState(null);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);
 
  useEffect(() => {
    const fetchService = async () => {
      try {
        const { data } = await api.get(`/services/${serviceId}`);
        setService(data.data);
        setProvider(data.data.provider);
      } catch (e) {
        toast.error('Service not found');
        navigate('/providers');
      }
    };
    fetchService();
  }, [serviceId]);
 
  const handleDateClick = async (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return;
 
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlots([]);
    setLoadingSlots(true);
    setStep(2);
 
    try {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
 
      const { data } = await api.get(
        `/availability/${provider._id}?date=${dateStr}&serviceId=${serviceId}`
      );
      setSlots(data.data.slots || []);
    } catch (e) {
      console.error(e);
      setSlots([]);
      toast.error('Failed to load time slots');
    } finally {
      setLoadingSlots(false);
    }
  };
 
  const handleBook = async () => {
    if (!selectedSlot) return toast.error('Please select a time slot');
    setBooking(true);
    try {
      const { data } = await api.post('/appointments', {
        serviceId,
        providerId: provider._id,
        dateTime: selectedSlot.startTime,
        notes,
        recurring
      });
      setBooked(data.data);
      setStep(4);
      toast.success('Appointment booked successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };
 
  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
 
  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return '';
    const day = date.getDay();
    if (day === 0 || day === 6) return '';
    return 'available-date';
  };
 
  if (!service || !provider) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#64748b', fontSize: 16 }}>Loading service...</div>
      </div>
    );
  }
 
  return (
    <div style={{ minHeight: '100vh', background: '#0a0c14', padding: '40px 24px', color: '#f1f5f9' }}>
      <style>{`
        .react-calendar {
          background: rgba(30,41,59,0.9) !important;
          border: 1px solid rgba(99,102,241,0.2) !important;
          border-radius: 16px !important;
          padding: 16px !important;
          width: 100% !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation button {
          color: #f1f5f9 !important;
          background: none !important;
          font-size: 16px !important;
          font-weight: 700 !important;
          border-radius: 8px !important;
          min-width: 44px !important;
        }
        .react-calendar__navigation button:hover {
          background: rgba(99,102,241,0.15) !important;
        }
        .react-calendar__navigation button:disabled {
          color: #374151 !important;
        }
        .react-calendar__month-view__weekdays {
          color: #64748b !important;
          font-size: 12px !important;
          font-weight: 600 !important;
        }
        .react-calendar__month-view__weekdays abbr {
          text-decoration: none !important;
        }
        .react-calendar__tile {
          color: #4b5563 !important;
          background: none !important;
          border-radius: 8px !important;
          padding: 12px 6px !important;
          font-size: 14px !important;
          cursor: not-allowed !important;
        }
        .react-calendar__tile:disabled {
          color: #374151 !important;
          opacity: 0.4 !important;
        }
        .react-calendar__tile.available-date {
          color: #f1f5f9 !important;
          background: rgba(99,102,241,0.12) !important;
          cursor: pointer !important;
          font-weight: 600 !important;
        }
        .react-calendar__tile.available-date:hover {
          background: rgba(99,102,241,0.35) !important;
          color: #fff !important;
          transform: scale(1.05) !important;
        }
        .react-calendar__tile--active,
        .react-calendar__tile--active.available-date {
          background: linear-gradient(135deg,#6366f1,#8b5cf6) !important;
          color: #fff !important;
          font-weight: 700 !important;
        }
        .react-calendar__tile--now {
          border: 1px solid rgba(99,102,241,0.5) !important;
        }
      `}</style>
 
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', color: '#64748b',
          cursor: 'pointer', marginBottom: 24, fontSize: 14
        }}>
          <ArrowLeft size={16} /> Back
        </button>
 
        {step < 4 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            {['Select Date', 'Choose Time', 'Confirm'].map((label, i) => {
              const n = i + 1;
              const active = step === n;
              const done = step > n;
              return (
                <React.Fragment key={label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: done ? '#10b981' : active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(30,41,59,0.8)',
                      border: `2px solid ${done || active ? 'transparent' : 'rgba(99,102,241,0.2)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: done || active ? '#fff' : '#64748b'
                    }}>
                      {done ? '✓' : n}
                    </div>
                    <span style={{ color: active ? '#f1f5f9' : '#64748b', fontSize: 13, fontWeight: active ? 600 : 400 }}>
                      {label}
                    </span>
                  </div>
                  {i < 2 && (
                    <div style={{ flex: 1, height: 1, background: done ? '#10b981' : 'rgba(99,102,241,0.15)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
 
        <div style={{ display: 'grid', gridTemplateColumns: step === 4 ? '1fr' : '1fr 300px', gap: 24, alignItems: 'start' }}>
          <div>
 
            {/* STEP 1 - Calendar */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CalIcon size={22} color="#818cf8" /> Select a Date
                </h2>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 20 }}>
                  Click any highlighted date to see available time slots
                </p>
                <Calendar
                  onClickDay={handleDateClick}
                  value={selectedDate}
                  minDate={new Date()}
                  tileDisabled={tileDisabled}
                  tileClassName={tileClassName}
                />
                <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)' }} />
                    <span style={{ color: '#64748b', fontSize: 12 }}>Available (click to select)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 14, height: 14, borderRadius: 4, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
                    <span style={{ color: '#64748b', fontSize: 12 }}>Selected</span>
                  </div>
                </div>
              </div>
            )}
 
            {/* STEP 2 - Time Slots */}
            {step === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <button
                    onClick={() => { setStep(1); setSelectedSlot(null); }}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
                    {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                </div>
 
                {loadingSlots ? (
                  <div>
                    <p style={{ color: '#64748b', marginBottom: 16, fontSize: 14 }}>Loading available slots...</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} style={{ height: 52, background: 'rgba(30,41,59,0.4)', borderRadius: 10 }} />
                      ))}
                    </div>
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <Clock size={48} style={{ color: '#374151', margin: '0 auto 16px', display: 'block' }} />
                    <p style={{ color: '#64748b', fontSize: 16, marginBottom: 8 }}>No available slots for this date</p>
                    <p style={{ color: '#4b5563', fontSize: 13, marginBottom: 24 }}>
                      This may be because the provider is fully booked or the booking window has passed.
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        padding: '10px 24px', borderRadius: 10,
                        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                        color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600
                      }}
                    >
                      ← Pick Another Date
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16 }}>
                      {slots.filter(s => s.isAvailable).length} slots available — click one to book
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {slots.map((slot, i) => (
                        <button
                          key={i}
                          disabled={!slot.isAvailable}
                          onClick={() => { setSelectedSlot(slot); setStep(3); }}
                          style={{
                            padding: '14px 8px', borderRadius: 10,
                            background: !slot.isAvailable
                              ? 'rgba(15,23,42,0.3)'
                              : selectedSlot?.startTime === slot.startTime
                                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                                : 'rgba(30,41,59,0.8)',
                            color: !slot.isAvailable ? '#374151' : '#f1f5f9',
                            fontSize: 14, fontWeight: slot.isAvailable ? 600 : 400,
                            cursor: slot.isAvailable ? 'pointer' : 'not-allowed',
                            border: `1px solid ${slot.isAvailable ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                            transition: 'all 0.2s'
                          }}
                        >
                          {slot.displayTime}
                          {!slot.isAvailable && (
                            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>Booked</div>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
 
            {/* STEP 3 - Confirm */}
            {step === 3 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4 }}
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Confirm Booking</h2>
                </div>
 
                <div style={{
                  background: 'rgba(30,41,59,0.6)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 16, padding: 24, marginBottom: 20
                }}>
                  {[
                    { label: 'Service', value: service.name },
                    { label: 'Provider', value: provider.businessName },
                    { label: 'Date', value: selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                    { label: 'Time', value: selectedSlot?.displayTime },
                    { label: 'Duration', value: `${service.duration} minutes` },
                    { label: 'Price', value: service.price?.amount === 0 ? 'Free' : `$${service.price?.amount}` }
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      display: 'flex', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid rgba(99,102,241,0.08)'
                    }}>
                      <span style={{ color: '#64748b', fontSize: 14 }}>{label}</span>
                      <span style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
 
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Any special requests or information..."
                    rows={3}
                    style={{
                      width: '100%', padding: '12px 16px',
                      background: 'rgba(15,23,42,0.8)',
                      border: '1px solid rgba(99,102,241,0.2)',
                      borderRadius: 10, color: '#f1f5f9',
                      fontSize: 14, resize: 'vertical',
                      outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box'
                    }}
                  />
                </div>
 
                {service.allowRecurring && (
                  <div style={{ marginBottom: 20, padding: 16, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Repeat size={16} color="#818cf8" />
                      <span style={{ color: '#f1f5f9', fontWeight: 600, fontSize: 14 }}>Make Recurring?</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {[null, 'weekly', 'biweekly', 'monthly'].map(freq => (
                        <button
                          key={String(freq)}
                          onClick={() => setRecurring(freq ? { frequency: freq } : null)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 13, border: 'none',
                            background: (recurring?.frequency === freq || (!recurring && !freq))
                              ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                              : 'rgba(30,41,59,0.6)',
                            color: '#fff', cursor: 'pointer'
                          }}
                        >
                          {freq ? freq.charAt(0).toUpperCase() + freq.slice(1) : 'Once'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
 
                <button
                  onClick={handleBook}
                  disabled={booking}
                  style={{
                    width: '100%', padding: 16, borderRadius: 12,
                    background: booking ? '#374151' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    color: '#fff', fontSize: 16, fontWeight: 700,
                    border: 'none', cursor: booking ? 'not-allowed' : 'pointer',
                    boxShadow: booking ? 'none' : '0 4px 20px rgba(99,102,241,0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  {booking ? '⏳ Confirming...' : '✅ Confirm Booking'}
                </button>
              </div>
            )}
 
            {/* STEP 4 - Success */}
            {step === 4 && booked && (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <div style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: 'rgba(16,185,129,0.1)', border: '3px solid #10b981',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px'
                }}>
                  <CheckCircle size={44} color="#10b981" />
                </div>
                <h2 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>Booking Confirmed! 🎉</h2>
                <p style={{ color: '#64748b', marginBottom: 8, fontSize: 15 }}>
                  Reference:{' '}
                  <strong style={{ color: '#818cf8', fontFamily: 'monospace', fontSize: 17 }}>
                    {booked.bookingRef}
                  </strong>
                </p>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>
                  Confirmation email sent to <strong>{user?.email}</strong>
                </p>
                <p style={{ color: '#4b5563', fontSize: 13, marginBottom: 36 }}>
                  You will receive a reminder 24 hours before your appointment.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={() => navigate('/appointments')}
                    style={{
                      padding: '13px 28px', borderRadius: 10,
                      background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                      color: '#fff', fontSize: 15, fontWeight: 700, border: 'none', cursor: 'pointer'
                    }}
                  >
                    View My Appointments
                  </button>
                  <button
                    onClick={() => navigate('/providers')}
                    style={{
                      padding: '13px 28px', borderRadius: 10,
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#818cf8', fontSize: 15, fontWeight: 600,
                      background: 'none', cursor: 'pointer'
                    }}
                  >
                    Book Another
                  </button>
                </div>
              </div>
            )}
          </div>
 
          {/* Sidebar */}
          {step < 4 && (
            <div style={{
              background: 'rgba(30,41,59,0.6)',
              border: '1px solid rgba(99,102,241,0.15)',
              borderRadius: 20, padding: 24,
              position: 'sticky', top: 80
            }}>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6, color: '#f1f5f9' }}>
                {service.name}
              </h3>
              {service.description && (
                <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16, lineHeight: 1.6 }}>
                  {service.description}
                </p>
              )}
              <div style={{ borderTop: '1px solid rgba(99,102,241,0.1)', paddingTop: 16 }}>
                {[
                  { label: 'Provider', value: provider.businessName },
                  { label: 'Duration', value: `${service.duration} min` },
                  { label: 'Price', value: service.price?.amount === 0 ? 'Free' : `$${service.price?.amount}` },
                  { label: 'Buffer time', value: `${provider.bufferTime || 15} min` }
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: '#64748b', fontSize: 13 }}>{label}</span>
                    <span style={{ color: '#f1f5f9', fontSize: 13, fontWeight: 600 }}>{value}</span>
                  </div>
                ))}
              </div>
              {selectedDate && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)' }}>
                  <p style={{ color: '#818cf8', fontSize: 12, fontWeight: 700, margin: '0 0 4px' }}>SELECTED</p>
                  <p style={{ color: '#f1f5f9', fontSize: 13, margin: 0 }}>
                    {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {selectedSlot && ` at ${selectedSlot.displayTime}`}
                  </p>
                </div>
              )}
              {provider.cancellationPolicy?.description && (
                <div style={{ marginTop: 16, padding: 12, background: 'rgba(99,102,241,0.05)', borderRadius: 10 }}>
                  <p style={{ color: '#64748b', fontSize: 12, lineHeight: 1.6, margin: 0 }}>
                    <strong style={{ color: '#94a3b8' }}>Cancellation: </strong>
                    {provider.cancellationPolicy.description}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 