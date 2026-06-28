import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';

interface Match {
  category: string;
  description: string;
  icon?: string;
  color?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  rating: number;
  imageUrl?: string;
  redirectUrl: string;
}

interface Pairing {
  id: string;
  inviteCode: string;
  status: 'pending' | 'active' | 'disconnected';
  partnerEmail: string | null;
  partnerCompassCompleted: number;
}

const MatchReveal: React.FC = () => {
  const navigate = useNavigate();
  const [matches] = useState<Match[]>([
    { category: 'Deep Conversation', description: 'Explore the unsaid with guided prompts for intimacy.', icon: 'forum', color: 'secondary' },
    { category: '15-Minute Massage', description: 'A gentle tactile exchange to release physical tension.', icon: 'self_improvement', color: 'primary' },
    { category: 'Slow Breathwork', description: 'Synchronized breathing to align your nervous systems.', icon: 'air', color: 'tertiary' }
  ]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [products, setProducts] = useState<Product[]>([]);

  // Pairing & empty states
  const [pairing, setPairing] = useState<Pairing | null>(null);
  const [inviteInput, setInviteInput] = useState('');
  const [nudgeStatus, setNudgeStatus] = useState<string | null>(null);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);

  // Vibe Check drawer states
  const [showVibeCheck, setShowVibeCheck] = useState(false);
  const [physicalEnergy, setPhysicalEnergy] = useState(75);
  const [emotionalCapacity, setEmotionalCapacity] = useState(50);
  const [duration, setDuration] = useState(15);
  const [focusElement, setFocusElement] = useState<'Somatic' | 'Verbal' | 'Breathing'>('Somatic');

  // LLM itinerary generation task states
  const [generating, setGenerating] = useState(false);
  const [itineraryTaskId, setItineraryTaskId] = useState<string | null>(null);

  const token = localStorage.getItem('versa_token');
  const pairingId = localStorage.getItem('versa_pairing_id') || 'pairing-123-uuid';

  const fetchPairingStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/relationship/pairing-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setPairing(data.pairing);
          if (data.pairing && data.pairing.id) {
            localStorage.setItem('versa_pairing_id', data.pairing.id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPairingStatus();
  }, [token]);

  useEffect(() => {
    // Fetch products curated for their overlapping desires
    const fetchProducts = async () => {
      try {
        const prodRes = await fetch(`${API_BASE_URL}/v1/products/recommend/${pairingId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success) {
            setProducts(prodData.products);
          }
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    if (pairing && pairing.status === 'active' && pairing.partnerCompassCompleted === 1) {
      fetchProducts();
    }
  }, [pairingId, token, pairing]);

  // Polling for generative itinerary task completion
  useEffect(() => {
    if (!itineraryTaskId) return;

    let intervalId: ReturnType<typeof setInterval>;

    const pollTask = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/itinerary/tasks/${itineraryTaskId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Polling failed');
        const data = await response.json();

        if (data.success && data.task) {
          const { status } = data.task;
          if (status === 'completed') {
            clearInterval(intervalId);
            setItineraryTaskId(null);
            setGenerating(false);
            setShowVibeCheck(false);
            navigate('/date');
          } else if (status === 'error') {
            clearInterval(intervalId);
            setItineraryTaskId(null);
            setGenerating(false);
            alert('Failed to construct dynamic itinerary. Launching pre-vetted fallback instead.');
            navigate('/date');
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    intervalId = setInterval(pollTask, 2000);
    return () => clearInterval(intervalId);
  }, [itineraryTaskId]);

  const handleStartSession = async () => {
    setGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/itinerary/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pairingId,
          energyLevel: physicalEnergy > 50 ? 'High' : 'Low',
          duration,
          focus: focusElement
        })
      });

      if (!response.ok) throw new Error('Failed to generate session');
      const data = await response.json();
      if (data.success && data.taskId) {
        setItineraryTaskId(data.taskId);
      } else {
        setGenerating(false);
        alert('Server did not return a valid task tracking ID. Loading pre-vetted session.');
        navigate('/date');
      }
    } catch (err) {
      console.error(err);
      setGenerating(false);
      navigate('/date');
    }
  };

  const handleLinkInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteInput.trim()) return;
    try {
      const res = await fetch(`${API_BASE_URL}/v1/relationship/link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode: inviteInput.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setInviteInput('');
        fetchPairingStatus();
      } else {
        alert(data.error || 'Failed to link accounts.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNudgePartner = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/v1/relationship/nudge`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNudgeStatus('Warm Nudge sent successfully!');
        setTimeout(() => setNudgeStatus(null), 3000);
      } else {
        setNudgeStatus('Nudge failed to send. Partner offline.');
        setTimeout(() => setNudgeStatus(null), 3000);
      }
    } catch (err) {
      setNudgeStatus('Nudge failed. Please try again.');
      setTimeout(() => setNudgeStatus(null), 3000);
    }
  };

  const handleUnlink = async () => {
    if (!pairing) return;
    const confirm = window.confirm('Are you absolutely sure you want to sever your pairing connection? This will purge all shared calendar events and active practices.');
    if (!confirm) return;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/relationship/unlink`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pairingId: pairing.id })
      });
      if (res.ok) {
        localStorage.removeItem('versa_token');
        localStorage.removeItem('versa_pairing_id');
        localStorage.removeItem('versa_user_email');
        navigate('/');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. EMPTY STATE: Waiting for Partner pairing invitation
  if (!pairing || pairing.status === 'pending') {
    return (
      <div className="bg-[#0e0e0e] text-[#fcf9f8] min-h-screen flex items-center justify-center font-body px-6 select-none">
        <div className="bg-[#131313] p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl w-full max-w-sm space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
              <span className="material-symbols-outlined text-[#f183ff] text-3xl">favorite</span>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-100">Intimacy Sanctuary</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Connect your partner's account to share accelerators, schedules, and nervous system pacer guides.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#000000] border border-outline-variant/10 text-center space-y-2">
            <span className="text-[10px] uppercase tracking-wider text-[#767575] font-label">Your Invite Code</span>
            <div className="text-xl font-headline font-bold text-[#ff9800] tracking-widest">{pairing ? pairing.inviteCode : '...'}</div>
            <button
              onClick={() => {
                if (pairing) {
                  navigator.clipboard.writeText(pairing.inviteCode);
                  alert('Invite code copied to clipboard!');
                }
              }}
              className="text-[10px] font-bold text-primary hover:opacity-80 active:scale-95"
            >
              Copy Invite Code
            </button>
          </div>

          <form onSubmit={handleLinkInvite} className="space-y-4 pt-4 border-t border-outline-variant/5">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-label text-[#767575]">Enter Partner's Code</label>
              <input
                type="text"
                value={inviteInput}
                onChange={e => setInviteInput(e.target.value)}
                className="w-full bg-[#000000] border border-outline-variant/10 focus:border-primary/50 text-sm font-semibold rounded-2xl px-4 py-3 text-slate-200 outline-none transition-colors text-center uppercase tracking-widest"
                placeholder="ABCDEF"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
            >
              Link Partner Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. EMPTY STATE: Partner has not completed Connection Compass intake quiz
  if (pairing.status === 'active' && pairing.partnerCompassCompleted === 0) {
    return (
      <div className="bg-[#0e0e0e] text-[#fcf9f8] min-h-screen flex items-center justify-center font-body px-6 select-none">
        <div className="bg-[#131313] p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl w-full max-w-sm space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto border border-secondary/20">
            <span className="material-symbols-outlined text-[#ff9800] text-3xl">hourglass_empty</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-headline font-bold text-xl text-slate-100">Aligning Accelerators</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed px-2">
              Your account is successfully linked with <span className="font-semibold text-slate-300">{pairing.partnerEmail}</span>. We are waiting for them to complete their Connection Compass onboarding chat.
            </p>
          </div>

          {nudgeStatus && (
            <div className="bg-primary/10 border border-primary/20 text-[#f183ff] text-xs font-semibold p-3 rounded-xl">
              {nudgeStatus}
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-outline-variant/5">
            <button
              onClick={handleNudgePartner}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide shadow-lg active:scale-[0.98] transition-all"
            >
              Nudge Partner
            </button>
            <button
              onClick={handleUnlink}
              className="w-full py-3 rounded-3xl text-on-surface-variant hover:text-error text-xs font-semibold transition-colors"
            >
              Cancel Link / Sever Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 3. STANDARD STATE: Both partners linked and completed onboarding
  return (
    <div className="bg-surface text-on-surface font-body min-h-screen relative antialiased select-none pb-28">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-40 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-lg mx-auto">
          <div className="w-8"></div>
          <div className="flex items-center gap-2">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg" 
              alt="Versa Logo" 
              className="w-7 h-7"
            />
            <h1 className="font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container text-xl tracking-tight">
              Versa
            </h1>
          </div>
          <button 
            onClick={() => setShowSettingsDrawer(true)} 
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto md:max-w-4xl p-6 pt-24 space-y-12">
        <section className="space-y-2">
          <h2 className="font-headline text-3xl font-bold tracking-tight">
            Current <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Connections</span>
          </h2>
          <p className="font-body text-on-surface-variant text-sm">Explore your active blind matches and curated suggestions.</p>
        </section>

        {/* Matches Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedMatch(match)}
              className="bg-surface-container-low rounded-2xl p-5 relative overflow-hidden group cursor-pointer hover:bg-surface-container-high border border-outline-variant/5 active:scale-[0.98] transition-all duration-300"
            >
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <div className="flex items-start justify-between relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#b8ffbb]"></span>
                    <span className="font-label text-[10px] tracking-wider uppercase text-tertiary">Active Match</span>
                  </div>
                  <h3 className="font-headline font-semibold text-lg text-on-surface">{match.category}</h3>
                  <p className="font-body text-xs text-on-surface-variant">{match.description}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-lg">{match.icon || 'star'}</span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Curated Product Recommendation Cards */}
        {products.length > 0 && (
          <section className="space-y-6">
            <h3 className="font-headline font-semibold text-xl text-on-surface-variant flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">auto_awesome</span>
              Curated for Your Vibe
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              {products.map(prod => (
                <div 
                  key={prod.id}
                  className="rounded-[2rem] bg-surface-container-low p-6 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden border border-outline-variant/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="w-full md:w-48 h-48 rounded-2xl overflow-hidden relative shadow-lg bg-surface-container-high flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary/40">shopping_bag</span>
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <span className="font-label text-xs uppercase tracking-widest text-on-surface-variant">{prod.brand}</span>
                      <h4 className="font-headline font-bold text-xl text-on-surface">{prod.name}</h4>
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-1 text-secondary">
                      <span className="material-symbols-outlined text-sm">star</span>
                      <span className="text-xs font-semibold text-on-surface">{prod.rating} / 5</span>
                    </div>
                    <a 
                      href={prod.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-surface-container-highest hover:bg-primary/20 text-primary text-xs font-semibold px-4 py-2 rounded-full border border-outline-variant/30 transition-all"
                    >
                      View Ethical Retailer
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Floating Bottom Date trigger button */}
      <div className="fixed bottom-[76px] left-0 right-0 max-w-lg mx-auto p-4 z-30 bg-gradient-to-t from-[#0e0e0e] via-[#0e0e0e]/95 to-transparent flex justify-center">
        <button 
          onClick={() => setShowVibeCheck(true)}
          className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold font-headline py-4 rounded-3xl text-base tracking-tight flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(241,131,255,0.3)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Check In Vibe & Start Date
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>

      {/* Vibe Check sliding Drawer Overlay */}
      {showVibeCheck && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-surface border-t border-outline-variant/20 rounded-t-[2.5rem] w-full max-w-lg p-6 space-y-8 animate-slide-up shadow-2xl relative">
            {generating && (
              <div className="absolute inset-0 bg-surface/90 rounded-t-[2.5rem] z-[70] flex flex-col items-center justify-center space-y-6 px-8 text-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-ping"></div>
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-primary animate-pulse">spa</span>
                  </div>
                </div>
                <h3 className="font-headline text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                  Calming Nervous Systems
                </h3>
                <p className="text-on-surface-variant text-sm leading-relaxed max-w-xs">
                  Guide is aligning Brakes and Accelerators. Please take a deep breath together...
                </p>
              </div>
            )}

            <div className="flex justify-between items-center">
              <button onClick={() => setShowVibeCheck(false)} className="text-on-surface-variant hover:text-primary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-headline font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                The Vibe Check
              </h3>
              <div className="w-10"></div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-label">
                  <span>Physical Energy</span>
                  <span className="text-secondary font-bold">{physicalEnergy}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={physicalEnergy} 
                  onChange={(e) => setPhysicalEnergy(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-label">
                  <span>Emotional Capacity</span>
                  <span className="text-primary font-bold">{emotionalCapacity}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={emotionalCapacity} 
                  onChange={(e) => setEmotionalCapacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-headline font-bold text-sm tracking-tight">Duration</h4>
              <div className="bg-surface-container-lowest p-1 rounded-full flex outline outline-1 outline-outline-variant/25">
                {[15, 30, 45].map(d => (
                  <button 
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
                      duration === d 
                        ? 'bg-secondary text-on-secondary shadow-md' 
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-headline font-bold text-sm tracking-tight">Focus Element</h4>
              <div className="flex gap-2">
                {(['Somatic', 'Verbal', 'Breathing'] as const).map(item => (
                  <button 
                    key={item}
                    onClick={() => setFocusElement(item)}
                    className={`flex-1 py-3 px-4 rounded-full border text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                      focusElement === item 
                        ? 'bg-primary-dim text-on-primary border-primary shadow-lg' 
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant/10 hover:text-on-surface'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[1rem]">
                      {item === 'Somatic' ? 'self_improvement' : item === 'Verbal' ? 'forum' : 'air'}
                    </span>
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleStartSession}
              className="w-full bg-gradient-to-r from-primary to-primary-container text-white font-bold py-4 rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
            >
              Begin Curated Session
            </button>
          </div>
        </div>
      )}

      {/* Read-Only Connections Detail Drawer */}
      {selectedMatch && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-surface border-t border-outline-variant/20 rounded-t-[2.5rem] w-full max-w-lg p-6 space-y-6 animate-slide-up shadow-2xl relative">
            <div className="flex justify-between items-center">
              <button onClick={() => setSelectedMatch(null)} className="text-on-surface-variant hover:text-primary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-headline font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                Connection Detail
              </h3>
              <div className="w-10"></div>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-surface-container-high border border-outline-variant/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-2xl">
                  {selectedMatch.category === 'Deep Conversation' ? 'forum' : selectedMatch.category === '15-Minute Massage' ? 'self_improvement' : 'air'}
                </span>
              </div>
              <div>
                <h4 className="font-headline font-bold text-lg text-on-surface">{selectedMatch.category}</h4>
                <p className="font-body text-xs text-on-surface-variant">Active Overlap Connection</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h5 className="font-label text-xs uppercase tracking-wider text-on-surface-variant/70">Desire Summary</h5>
                <p className="font-body text-sm text-on-surface leading-relaxed">{selectedMatch.description}</p>
              </div>

              <div className="space-y-1">
                <h5 className="font-label text-xs uppercase tracking-wider text-on-surface-variant/70">What the Practice Entails</h5>
                <p className="font-body text-sm text-on-surface leading-relaxed">
                  {selectedMatch.category === 'Deep Conversation' && 
                    'Guided deep vulnerability query exchange. Partners take turns asking and reflecting on thought-provoking prompts designed to lower defenses and uncover hidden facets of intimacy.'}
                  {selectedMatch.category === '15-Minute Massage' && 
                    'A structured, somatic tactile practice centered on nervous system regulation. Partners exchange slow, high-boundary-respecting physical touch focusing on areas of tension like the shoulders and neck.'}
                  {selectedMatch.category === 'Slow Breathwork' && 
                    'Synchronized breathing and co-regulation exercises. By aligning breathing paces and utilizing eye contact, partners reduce cortisol levels and establish deep physiological resonance.'}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setSelectedMatch(null)}
              className="w-full py-4 rounded-xl bg-surface-container-highest text-on-surface font-bold text-sm tracking-wide border border-outline-variant/25 transition-all hover:bg-surface-container-high"
            >
              Close Summary
            </button>
          </div>
        </div>
      )}

      {/* Settings Drawer (Unlinking Switch) */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex justify-center items-end">
          <div className="bg-surface border-t border-outline-variant/20 rounded-t-[2.5rem] w-full max-w-lg p-6 space-y-6 animate-slide-up shadow-2xl relative">
            <div className="flex justify-between items-center">
              <button onClick={() => setShowSettingsDrawer(false)} className="text-on-surface-variant hover:text-primary p-2">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h3 className="font-headline font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">
                Sanctuary Settings
              </h3>
              <div className="w-10"></div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/10 text-center">
                <span className="text-xs text-on-surface-variant font-label uppercase">Linked Partner</span>
                <p className="text-sm font-semibold text-slate-200 mt-1">{pairing.partnerEmail}</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-label text-xs uppercase tracking-wider text-on-surface-variant/70">Sovereignty & Security</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Severing your connection triggers our Cryptographic Self-Destruct protocol. All shared calendar entries, active date histories, and preference matches will be wiped from our database immediately.
                </p>
              </div>
            </div>

            <button
              onClick={handleUnlink}
              className="w-full py-4 rounded-3xl bg-error-dim hover:bg-red-700 text-on-error font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
            >
              Sever Connection (Self-Destruct)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchReveal;
