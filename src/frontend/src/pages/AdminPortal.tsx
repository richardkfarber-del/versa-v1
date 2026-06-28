import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api';

interface Itinerary {
  id: string;
  title: string;
  description: string;
  steps: string;
  is_premium: number;
  tags: string;
}

interface StepInput {
  step: number;
  title: string;
  instructions: string;
}

const AdminPortal: React.FC = () => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('versa_admin_token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Portal View states
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<StepInput[]>([
    { step: 1, title: '', instructions: '' }
  ]);

  const [syncStatus, setSyncStatus] = useState<string>('Unknown');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchAdminData = async (adminToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/itineraries`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setItineraries(data.itineraries);
        }
      }

      // Fetch git sync status
      const syncRes = await fetch(`${API_BASE_URL}/v1/sync/status`, {
        headers: { 'Authorization': `Bearer ${adminToken}` } // Reusing middleware or admin token
      });
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (syncData.success && syncData.metadata) {
          setSyncStatus(syncData.metadata.last_sync_status || 'Unknown');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAdminData(token);
    }
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success && data.token) {
        localStorage.setItem('versa_admin_token', data.token);
        setToken(data.token);
      } else {
        setError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setError('Connection failed. Admin server offline.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('versa_admin_token');
    setToken(null);
  };

  const handleAddStep = () => {
    setSteps(prev => [...prev, { step: prev.length + 1, title: '', instructions: '' }]);
  };

  const handleStepChange = (index: number, field: keyof StepInput, value: string) => {
    setSteps(prev => {
      const copy = [...prev];
      if (field === 'step') {
        copy[index][field] = Number(value);
      } else {
        copy[index][field] = value as any;
      }
      return copy;
    });
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || steps.some(s => !s.title || !s.instructions)) {
      alert('Please fill out all fields and steps.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/itineraries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          description,
          steps,
          isPremium,
          tags
        })
      });

      if (response.ok) {
        // Reset form
        setTitle('');
        setDescription('');
        setIsPremium(false);
        setTags('');
        setSteps([{ step: 1, title: '', instructions: '' }]);
        setStatusMessage('Intinerary published and added to sync journal!');
        setTimeout(() => setStatusMessage(null), 3000);
        fetchAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePremium = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/itineraries/toggle-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (response.ok) {
        fetchAdminData(token!);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvalidateCache = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/admin/cache/invalidate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Prompt cache invalidated successfully!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token) {
    return (
      <div className="bg-[#0e0e0e] text-[#fcf9f8] min-h-screen flex items-center justify-center font-body px-4 select-none">
        <div className="bg-[#131313] p-8 rounded-[2.5rem] border border-outline-variant/10 shadow-2xl w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
              <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            </div>
            <h2 className="font-headline font-bold text-2xl text-slate-100">Admin Workspace</h2>
            <p className="text-xs text-on-surface-variant">Blair & Rachel Content Curation Portal</p>
          </div>

          {error && (
            <div className="bg-error-dim/20 border border-error-dim/40 text-error-dim rounded-2xl p-4 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-label text-on-surface-variant/80">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#000000] border border-outline-variant/10 focus:border-primary/50 text-sm font-semibold rounded-2xl px-4 py-3 text-slate-200 outline-none transition-colors"
                placeholder="blair@versa.com"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider font-label text-on-surface-variant/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#000000] border border-outline-variant/10 focus:border-primary/50 text-sm font-semibold rounded-2xl px-4 py-3 text-slate-200 outline-none transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
            >
              Access Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e0e] text-[#fcf9f8] min-h-screen pb-24 pt-20 px-6 font-body select-none">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0e0e0e]/80 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="flex items-center justify-between px-6 h-16 w-full max-w-5xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">admin_panel_settings</span>
            <span className="font-headline font-bold text-slate-200 text-lg">Versa Workspace</span>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-semibold rounded-full bg-surface-container-high border border-outline/10 text-on-surface-variant hover:text-white"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Publish Form */}
        <section className="md:col-span-2 space-y-6">
          <div className="bg-[#131313] p-6 rounded-[2.5rem] border border-outline-variant/5 space-y-6">
            <h3 className="font-headline font-bold text-xl text-slate-100 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">publish</span>
              Publish Intimacy Itinerary
            </h3>

            {statusMessage && (
              <div className="bg-tertiary/10 border border-tertiary/20 text-[#b8ffbb] text-xs font-semibold p-4 rounded-2xl text-center">
                {statusMessage}
              </div>
            )}

            <form onSubmit={handlePublish} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#767575] font-label">Itinerary Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-[#000000] border border-outline-variant/10 rounded-2xl px-4 py-3 text-sm outline-none text-slate-200"
                  placeholder="e.g. Lavender Aromatherapy Massage"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-[#767575] font-label">Description Summary</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-[#000000] border border-outline-variant/10 rounded-2xl px-4 py-3 text-sm outline-none text-slate-200 h-20"
                  placeholder="Summarize the tone, intention, and boundaries of this practice..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-[#767575] font-label">Search Tags (comma list)</label>
                  <input
                    type="text"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    className="w-full bg-[#000000] border border-outline-variant/10 rounded-2xl px-4 py-3 text-sm outline-none text-slate-200"
                    placeholder="somatic, tactile, high-energy"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="isPremiumCheck"
                    checked={isPremium}
                    onChange={e => setIsPremium(e.target.checked)}
                    className="w-5 h-5 rounded border-outline-variant/20 bg-[#000000] accent-primary"
                  />
                  <label htmlFor="isPremiumCheck" className="text-sm font-semibold font-label text-slate-300 cursor-pointer">Flag as Premium</label>
                </div>
              </div>

              {/* Dynamic steps builder */}
              <div className="space-y-3 pt-4 border-t border-outline-variant/5">
                <div className="flex justify-between items-center">
                  <h4 className="font-headline font-bold text-sm tracking-tight">Interval Steps</h4>
                  <button
                    type="button"
                    onClick={handleAddStep}
                    className="text-xs font-bold text-primary flex items-center gap-1 hover:opacity-80"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Add Step
                  </button>
                </div>

                <div className="space-y-4">
                  {steps.map((st, index) => (
                    <div key={index} className="p-4 rounded-2xl bg-[#201f1f]/20 border border-outline-variant/5 space-y-3">
                      <div className="flex justify-between items-center text-xs font-label">
                        <span className="text-[#767575]">Step {st.step}</span>
                      </div>
                      <input
                        type="text"
                        value={st.title}
                        onChange={e => handleStepChange(index, 'title', e.target.value)}
                        className="w-full bg-[#000000] border border-outline-variant/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                        placeholder="Interval Title (e.g. Eye Contact Alignment)"
                        required
                      />
                      <textarea
                        value={st.instructions}
                        onChange={e => handleStepChange(index, 'instructions', e.target.value)}
                        className="w-full bg-[#000000] border border-outline-variant/10 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none h-16"
                        placeholder="Detailed guided instructions for couples..."
                        required
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-3xl bg-gradient-to-r from-primary to-primary-container text-white font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
              >
                Publish Itinerary
              </button>
            </form>
          </div>
        </section>

        {/* Side Panel: Published List & Cache Control */}
        <section className="space-y-6">
          {/* Operations Card */}
          <div className="bg-[#131313] p-6 rounded-[2.5rem] border border-outline-variant/5 space-y-4">
            <h3 className="font-headline font-bold text-base text-slate-100 flex items-center">
              <span className="material-symbols-outlined mr-2 text-[#ff9800]">settings</span>
              Operations
            </h3>
            
            <div className="space-y-2 text-xs font-label">
              <div className="flex justify-between py-1 border-b border-outline-variant/5">
                <span className="text-[#767575]">Database Sync:</span>
                <span className={`font-bold ${syncStatus === 'Success' ? 'text-[#b8ffbb]' : 'text-[#ff9800]'}`}>{syncStatus}</span>
              </div>
            </div>

            <button
              onClick={handleInvalidateCache}
              className="w-full py-3.5 rounded-2xl bg-surface-container-high border border-outline-variant/10 text-on-surface-variant font-bold text-xs hover:text-white transition-colors"
            >
              Invalidate AI cache
            </button>
          </div>

          {/* Seeded Content Card */}
          <div className="bg-[#131313] p-6 rounded-[2.5rem] border border-outline-variant/5 space-y-4">
            <h3 className="font-headline font-bold text-base text-slate-100 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">menu_book</span>
              Published Content ({itineraries.length})
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-96 no-scrollbar">
              {itineraries.map(it => (
                <div key={it.id} className="p-4 rounded-2xl bg-[#201f1f]/20 border border-outline-variant/5 flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{it.title}</h4>
                    <p className="text-[10px] text-on-surface-variant mt-1 line-clamp-2">{it.description}</p>
                  </div>
                  <button
                    onClick={() => handleTogglePremium(it.id)}
                    className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      it.is_premium === 1 
                        ? 'bg-secondary/20 text-[#ff9800] border border-secondary/20' 
                        : 'bg-surface-container-high text-[#767575] border border-outline-variant/10'
                    }`}
                  >
                    {it.is_premium === 1 ? 'Premium' : 'Free'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPortal;
