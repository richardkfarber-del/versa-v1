import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { createClient } from '@supabase/supabase-js';

interface Step {
  step: number;
  title: string;
  instructions: string;
}

interface Itinerary {
  title: string;
  steps: Step[];
}

const ActiveDateNight: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(900); // Default 15 minutes
  const [isPaused, setIsPaused] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('versa_token');
  const pairingId = localStorage.getItem('versa_pairing_id') || 'pairing-123-uuid';

  // Supabase client instantiation
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Fetch initial state on load
  const fetchSessionState = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/relationship/active-session/${pairingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to load active session.');
      const data = await response.json();
      
      if (data.success && data.session) {
        const { timer_countdown, session_status, active_script_id } = data.session;
        setTimeLeft(timer_countdown);
        setIsPaused(session_status === 'Paused');
        
        if (session_status === 'Grounding') {
          navigate('/grounding');
        }

        if (active_script_id) {
          setItinerary(JSON.parse(active_script_id));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionState();

    // 2. Subscribe to Supabase Database Replication Changes on active_sessions table
    const channel = supabase
      .channel(`active_sessions_sync:${pairingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'active_sessions',
          filter: `pairing_id=eq.${pairingId}`
        },
        (payload) => {
          const { timer_countdown, session_status, active_script_id } = payload.new;
          setTimeLeft(timer_countdown);
          setIsPaused(session_status === 'Paused');
          
          if (session_status === 'Grounding') {
            navigate('/grounding');
          }

          if (active_script_id) {
            setItinerary(JSON.parse(active_script_id));
          }
        }
      )
      .subscribe();

    // 3. Robust Polling Fallback (runs every 2 seconds for offline-first support)
    const pollInterval = setInterval(fetchSessionState, 2000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [pairingId, token]);

  const updateSessionState = async (updates: { sessionStatus?: string; timerCountdown?: number; lastEventTriggered?: string }) => {
    try {
      await fetch(`${API_BASE_URL}/v1/itinerary/active`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          pairingId,
          sessionStatus: updates.sessionStatus,
          timerCountdown: updates.timerCountdown,
          lastEventTriggered: updates.lastEventTriggered
        })
      });
    } catch (err) {
      console.error('Failed to broadcast sync update:', err);
    }
  };

  const handleStop = async () => {
    // Red Light Safety Brake (Sets status to Grounding)
    await updateSessionState({
      sessionStatus: 'Grounding',
      timerCountdown: 0,
      lastEventTriggered: 'RED_LIGHT_TRIGGERED'
    });
    navigate('/grounding');
  };

  const togglePause = async () => {
    const nextPause = !isPaused;
    setIsPaused(nextPause);
    await updateSessionState({
      sessionStatus: nextPause ? 'Paused' : 'Timer_Active',
      lastEventTriggered: nextPause ? 'PAUSED_BY_USER' : 'RESUMED_BY_USER'
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = itinerary ? ((900 - timeLeft) / 900) * 100 : 0;
  const currentStep = itinerary && itinerary.steps ? itinerary.steps[currentStepIdx] : null;

  if (loading) {
    return (
      <div className="bg-surface text-on-surface h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen overflow-hidden relative select-none">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]"></div>
      </div>

      <header className="fixed top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-transparent backdrop-blur-xl bg-opacity-80">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/match')} className="material-symbols-outlined text-[#f183ff] text-2xl hover:opacity-80">arrow_back</button>
          <span className="text-xl font-bold tracking-tighter font-headline text-slate-200">
            {itinerary ? itinerary.title : "Active Practice"}
          </span>
        </div>
        <button 
          onClick={togglePause}
          className="px-6 py-2 rounded-full bg-surface-container-high border border-outline/20 text-on-surface text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-32 max-w-lg mx-auto">
        <div className="text-center mb-8 h-28 flex flex-col justify-center">
          {currentStep ? (
            <>
              <h2 className="font-headline text-on-surface-variant text-xs uppercase tracking-[0.2em] mb-2">
                Step {currentStep.step} of 3: {currentStep.title}
              </h2>
              <p className="text-lg font-medium leading-relaxed font-body">
                {currentStep.instructions}
              </p>
            </>
          ) : (
            <p className="text-lg font-medium leading-relaxed font-body">
              Focus on breathing deeply and aligning your posture...
            </p>
          )}
        </div>

        <div className="relative flex items-center justify-center w-64 h-64 mb-8">
          {!isPaused && <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse"></div>}
          <div className="absolute inset-4 rounded-full border border-secondary/20 glow-border"></div>
          
          <div className="flex flex-col items-center">
            <span className="font-headline text-6xl font-extrabold tracking-tighter text-on-surface drop-shadow-2xl">
              {formatTime(timeLeft)}
            </span>
            <span className="text-tertiary font-semibold tracking-[0.3em] uppercase text-[9px] mt-2">Remaining</span>
          </div>
        </div>

        <div className="w-full h-1 bg-surface-container-highest rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="w-full flex flex-col items-center gap-4">
          <button 
            onClick={handleStop}
            className="group relative flex flex-col items-center justify-center w-24 h-24 rounded-full transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-error-dim rounded-full shadow-[0_0_40px_rgba(215,51,87,0.4)] transition-all group-hover:shadow-[0_0_60px_rgba(215,51,87,0.6)]"></div>
            <div className="relative flex flex-col items-center text-on-error">
              <span className="material-symbols-outlined text-2xl mb-0.5">front_hand</span>
              <span className="font-headline font-extrabold text-[10px] tracking-widest">STOP</span>
            </div>
          </button>
          <p className="text-on-surface-variant text-[10px] font-medium text-center max-w-[240px] leading-relaxed opacity-60">
            Tap STOP at any time to immediately end the session. Your comfort is our priority.
          </p>
        </div>
      </main>

      {/* Nav Controls */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
        <button 
          onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined">skip_previous</span>
        </button>
        <button 
          onClick={togglePause}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary to-secondary-dim flex items-center justify-center text-on-secondary shadow-[0_10px_30px_rgba(255,152,0,0.3)] hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">
            {isPaused ? 'play_arrow' : 'pause'}
          </span>
        </button>
        <button 
          onClick={() => setCurrentStepIdx(prev => Math.min((itinerary?.steps.length || 1) - 1, prev + 1))}
          className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors"
        >
          <span className="material-symbols-outlined">skip_next</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveDateNight;
