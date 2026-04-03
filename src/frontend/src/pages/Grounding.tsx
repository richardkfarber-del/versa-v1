import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Grounding: React.FC = () => {
  const [phase, setPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      setPhase('Inhale');
      timeout = setTimeout(() => {
        setPhase('Hold');
        timeout = setTimeout(() => {
          setPhase('Exhale');
          timeout = setTimeout(runCycle, 4000); // 4s Exhale
        }, 4000); // 4s Hold
      }, 4000); // 4s Inhale
    };

    runCycle();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-tertiary/30 overflow-hidden h-screen w-screen flex flex-col relative">
      <header className="bg-transparent backdrop-blur-xl bg-opacity-80 dark:bg-[#0e0e0e]/80 docked full-width top-0 z-50 flex justify-between items-center w-full px-6 py-8">
        <div className="flex items-center">
          <img
            alt="Versa Logo"
            className="h-10 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg"
          />
        </div>
        <div className="flex items-center">
          <div className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse mr-2"></div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Grounding</span>
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center relative px-8">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-tertiary/10 rounded-full blur-glow opacity-30"></div>
          <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-primary/5 rounded-full blur-glow opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center breath-circle">
            <div className={`absolute w-80 h-80 rounded-full bg-tertiary/5 border border-tertiary/20 transition-all duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'scale-125' : phase === 'Exhale' ? 'scale-90' : 'scale-110'}`}></div>
            <div className={`w-64 h-64 rounded-full border-[0.5px] border-tertiary/40 flex items-center justify-center relative shadow-[0_0_60px_rgba(184,255,187,0.15)] transition-all duration-[4000ms] ease-in-out ${phase === 'Inhale' ? 'scale-110' : phase === 'Exhale' ? 'scale-95' : 'scale-100'}`}>
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-tertiary/30 to-tertiary/10 backdrop-blur-md"></div>
              <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-500">
                <span className="text-on-surface font-headline text-3xl font-light tracking-widest uppercase opacity-80">
                  {phase}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-24 text-center space-y-6 max-w-xs">
            <div className="flex flex-col gap-2">
              <h1 className="text-on-surface font-headline text-4xl font-extrabold tracking-tight">Pause</h1>
              <p className="text-on-surface-variant text-lg font-medium leading-relaxed">
                You are safe. Take all the time you need.
              </p>
            </div>
            <div className="flex justify-center items-center gap-4 py-8">
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${phase === 'Inhale' ? 'bg-tertiary text-on-tertiary' : 'text-on-surface-variant font-semibold'}`}>Inhale</div>
              <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${phase === 'Hold' ? 'bg-tertiary text-on-tertiary' : 'text-on-surface-variant font-semibold'}`}>Hold</div>
              <div className="w-1.5 h-1.5 rounded-full bg-surface-container-highest"></div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors duration-500 ${phase === 'Exhale' ? 'bg-tertiary text-on-tertiary' : 'text-on-surface-variant font-semibold'}`}>Exhale</div>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-12 flex flex-col items-center relative z-20">
        <button 
          onClick={() => navigate('/date')}
          className="group flex flex-col items-center gap-4 transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <div className="bg-surface-container-low p-6 rounded-full border border-outline-variant/20 shadow-xl group-hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-secondary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </div>
          <span className="font-label text-xs font-bold uppercase tracking-[0.3em] text-on-surface-variant group-hover:text-on-surface transition-colors">Resume when ready</span>
        </button>
      </footer>

      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]"></div>
    </div>
  );
};

export default Grounding;
