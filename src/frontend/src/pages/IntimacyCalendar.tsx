import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import logoImg from '../assets/Logo_1.png';

interface CalendarEvent {
  id: string;
  pairing_id: string;
  itinerary_id: string;
  proposed_by: string;
  scheduled_time: string; // YYYY-MM-DD
  status: 'Pending' | 'Confirmed' | 'Declined';
}

interface Itinerary {
  id: string;
  title: string;
  description: string;
  steps: string;
  is_premium: number;
  tags: string;
}

const IntimacyCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 27)); // Seed June 2026
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedItineraryId, setSelectedItineraryId] = useState<string>('');
  const [showPaywall, setShowPaywall] = useState(false);
  
  // Event details modal
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventItinerary, setEventItinerary] = useState<Itinerary | null>(null);

  const token = localStorage.getItem('versa_token');
  const pairingId = localStorage.getItem('versa_pairing_id') || 'pairing-123-uuid';

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // 1. Fetch Calendar Events
      const eventsRes = await fetch(`${API_BASE_URL}/v1/relationship/calendar/events`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        if (eventsData.success) {
          setEvents(eventsData.events);
        }
      }

      // 2. Fetch Itineraries
      const itinerariesRes = await fetch(`${API_BASE_URL}/v1/relationship/itineraries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (itinerariesRes.ok) {
        const itinerariesData = await itinerariesRes.json();
        if (itinerariesData.success) {
          setItineraries(itinerariesData.itineraries);
        }
      }

      // 3. Fetch Premium status
      const profileRes = await fetch(`${API_BASE_URL}/v1/compass/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          // If profileData doesn't have is_premium, check if any user flag exists
          setIsPremium(profileData.profile?.isPremium || false);
        }
      }
    } catch (err) {
      console.error('Failed to load calendar assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [token]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (dayStr: string) => {
    setSelectedDay(dayStr);
    setShowProposeModal(true);
  };

  const handleProposeSubmit = async () => {
    if (!selectedDay || !selectedItineraryId) return;

    // Check Premium paywall
    const selectedItinerary = itineraries.find(it => it.id === selectedItineraryId);
    if (selectedItinerary?.is_premium === 1 && !isPremium) {
      setShowPaywall(true);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/relationship/calendar/propose`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pairingId,
          itineraryId: selectedItineraryId,
          scheduledTime: selectedDay
        })
      });

      if (response.ok) {
        setShowProposeModal(false);
        setSelectedItineraryId('');
        fetchCalendarData();
      } else if (response.status === 403) {
        setShowPaywall(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventClick = (e: React.MouseEvent, ev: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(ev);
    const itinerary = itineraries.find(it => it.id === ev.itinerary_id) || null;
    setEventItinerary(itinerary);
  };

  const handleRespond = async (action: 'Accept' | 'Decline') => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`${API_BASE_URL}/v1/relationship/calendar/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          action
        })
      });

      if (response.ok) {
        setSelectedEvent(null);
        fetchCalendarData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Mock unlock premium for audit ease
  const handleUnlockPremium = () => {
    setIsPremium(true);
    setShowPaywall(false);
  };

  // Helper: Get days in month
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDayOfWeek = new Date(year, month, 1).getDay();

  const days = [];
  // Start offsets
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push(null);
  }
  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNum: i, dateString: dayStr });
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="bg-[#0e0e0e] text-[#fcf9f8] min-h-screen pb-28 pt-20 px-4 font-body select-none">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-center px-6 h-16 w-full max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <img 
              src={logoImg} 
              alt="Versa Logo" 
              className="w-8 h-8 object-contain rounded-md"
            />
            <span className="font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#f183ff] text-xl tracking-tight">
              Intimacy Calendar
            </span>
          </div>
        </div>
      </header>

      {/* Calendar Grid Container */}
      <main className="max-w-lg mx-auto mt-6 space-y-6">
        <div className="flex justify-between items-center bg-[#131313] p-4 rounded-3xl border border-outline-variant/5">
          <button onClick={handlePrevMonth} className="material-symbols-outlined text-[#f183ff] hover:opacity-80 active:scale-90 transition-transform">chevron_left</button>
          <h2 className="font-headline font-bold text-lg text-slate-200">
            {monthNames[month]} {year}
          </h2>
          <button onClick={handleNextMonth} className="material-symbols-outlined text-[#f183ff] hover:opacity-80 active:scale-90 transition-transform">chevron_right</button>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-[#131313] rounded-3xl p-4 border border-outline-variant/5 shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
            {/* Week Headers */}
            <div className="grid grid-cols-7 gap-1 text-center font-label text-[10px] uppercase tracking-widest text-[#767575] mb-2">
              <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d, index) => {
                if (d === null) {
                  return <div key={`empty-${index}`} className="h-20 bg-transparent"></div>;
                }

                // Check for events scheduled for this dateString
                const dayEvents = events.filter(e => e.scheduled_time === d.dateString);

                return (
                  <div
                    key={d.dateString}
                    onClick={() => handleDayClick(d.dateString)}
                    className="h-20 bg-[#201f1f]/30 hover:bg-[#201f1f] rounded-xl p-1.5 flex flex-col justify-between cursor-pointer border border-outline-variant/5 active:scale-95 transition-all duration-200 overflow-hidden"
                  >
                    <span className="text-[10px] font-semibold text-[#fcf9f8]/60">{d.dayNum}</span>
                    <div className="space-y-1">
                      {dayEvents.map(ev => {
                        const it = itineraries.find(i => i.id === ev.itinerary_id);
                        const isPending = ev.status === 'Pending';
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => handleEventClick(e, ev)}
                            className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full truncate leading-none ${
                              isPending
                                ? 'bg-secondary/20 text-[#ff9800] border border-secondary/30'
                                : 'bg-tertiary/20 text-[#b8ffbb] border border-tertiary/30'
                            }`}
                          >
                            {it ? it.title : 'Proposed'}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Propose Date Modal */}
      {showProposeModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-[#0e0e0e] border-t border-outline-variant/20 rounded-t-[2.5rem] w-full max-w-lg p-6 space-y-6 animate-slide-up shadow-2xl relative">
            <div className="flex justify-between items-center">
              <button onClick={() => setShowProposeModal(false)} className="text-on-surface-variant hover:text-primary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-headline font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Propose Intimacy Event
              </h3>
              <div className="w-10"></div>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-on-surface-variant font-label uppercase tracking-wider">Scheduled for: {selectedDay}</p>
              
              <div className="space-y-2">
                <label className="text-xs font-semibold font-label text-slate-300">Choose Practice Itinerary</label>
                <div className="space-y-2 overflow-y-auto max-h-48 no-scrollbar">
                  {itineraries.map(it => (
                    <button
                      key={it.id}
                      onClick={() => setSelectedItineraryId(it.id)}
                      className={`w-full p-4 rounded-2xl text-left border flex items-center justify-between transition-all ${
                        selectedItineraryId === it.id
                          ? 'bg-primary/10 border-primary'
                          : 'bg-[#131313] border-outline-variant/10 hover:border-outline-variant/30'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-bold text-sm text-slate-200">{it.title}</span>
                          {it.is_premium === 1 && (
                            <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-secondary/20 text-[#ff9800]">Premium</span>
                          )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5">{it.description}</p>
                      </div>
                      <span className="material-symbols-outlined text-[#f183ff]">
                        {selectedItineraryId === it.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleProposeSubmit}
              disabled={!selectedItineraryId}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide disabled:opacity-50 active:scale-[0.98] transition-all"
            >
              Propose Date Night
            </button>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-[#0e0e0e] border-t border-outline-variant/20 rounded-t-[2.5rem] w-full max-w-lg p-6 space-y-6 animate-slide-up shadow-2xl relative">
            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedEvent(null)} className="text-on-surface-variant hover:text-primary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-headline font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#f183ff]">
                Intimacy Event Details
              </h3>
              <div className="w-10"></div>
            </div>

            {eventItinerary && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 rounded-2xl bg-[#131313] border border-outline-variant/5">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-outline-variant/20">
                    <span className="material-symbols-outlined text-primary text-2xl">spa</span>
                  </div>
                  <div>
                    <h4 className="font-headline font-bold text-base text-slate-200">{eventItinerary.title}</h4>
                    <p className="text-[10px] text-on-surface-variant font-label tracking-wider uppercase">Scheduled: {selectedEvent.scheduled_time}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <h5 className="font-label text-xs uppercase tracking-wider text-on-surface-variant/70">Itinerary Overview</h5>
                  <p className="text-sm text-slate-300 leading-relaxed">{eventItinerary.description}</p>
                </div>

                <div className="space-y-1">
                  <h5 className="font-label text-xs uppercase tracking-wider text-on-surface-variant/70">Proposal Status</h5>
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${selectedEvent.status === 'Pending' ? 'bg-[#ff9800]' : 'bg-[#b8ffbb]'}`}></span>
                    <span className="text-sm font-semibold">{selectedEvent.status}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {selectedEvent.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => handleRespond('Accept')}
                    className="flex-1 py-4 rounded-3xl bg-gradient-to-r from-tertiary to-emerald-600 text-on-tertiary font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                  >
                    Accept Date
                  </button>
                  <button
                    onClick={() => handleRespond('Decline')}
                    className="flex-1 py-4 rounded-3xl bg-surface-container-high border border-outline/20 text-[#fcf9f8] font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                  >
                    Decline
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    localStorage.setItem('versa_pairing_id', pairingId);
                    navigate('/date');
                  }}
                  className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
                >
                  Start Practice Player
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex justify-center items-center px-4">
          <div className="bg-[#131313] border border-outline-variant/20 rounded-[2.5rem] w-full max-w-sm p-8 space-y-6 text-center relative shadow-2xl">
            <button onClick={() => setShowPaywall(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-primary p-2">
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center mx-auto border border-secondary/30">
              <span className="material-symbols-outlined text-[#ff9800] text-3xl">workspace_premium</span>
            </div>

            <div className="space-y-2">
              <h3 className="font-headline font-bold text-2xl text-slate-100">Unlock Premium</h3>
              <p className="text-on-surface-variant text-xs leading-relaxed px-2">
                Gain unlimited access to somatic touch guides, expert intimacy planners, and custom-guided breathing pacers.
              </p>
            </div>

            <div className="bg-[#0e0e0e] p-4 rounded-2xl border border-outline-variant/10">
              <span className="font-headline text-3xl font-extrabold text-slate-100">$9.99</span>
              <span className="text-xs text-on-surface-variant"> / month</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleUnlockPremium}
                className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
              >
                Mock Upgrade (Audit Ease)
              </button>
              <button
                onClick={() => setShowPaywall(false)}
                className="w-full py-3 rounded-3xl text-on-surface-variant hover:text-white text-xs font-semibold transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntimacyCalendar;
