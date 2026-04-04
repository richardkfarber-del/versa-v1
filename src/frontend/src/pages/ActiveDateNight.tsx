import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ActiveDateNight: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isPaused, setIsPaused] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStop = () => {
    navigate('/grounding');
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const progressPercentage = ((15 * 60 - timeLeft) / (15 * 60)) * 100;

  return (
    <div className="bg-surface text-on-surface font-body selection:bg-primary/30 min-h-screen overflow-hidden relative">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[100px]"></div>
        <div className="absolute inset-0 bg-fluid-mesh"></div>
      </div>

      <header className="fixed top-0 z-50 w-full px-6 py-4 flex justify-between items-center bg-transparent backdrop-blur-xl bg-opacity-80 dark:bg-[#0e0e0e]/80">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/match')} className="material-symbols-outlined text-[#f183ff] text-2xl hover:opacity-80">arrow_back</button>
          <div className="flex items-center gap-2">
            <img
              alt="Versa Logo"
              className="w-8 h-8"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrvmj9fE8wymT5lgT3LS-1I4tErKwpKlcZZuBgCtk4uUqeqJUROyAn248BClzDQ4WiWQNsUuKA0ARQj5N1rlYYBIBTJFlbVQOgKk7ssUajQdcgft3WfNInH_cstvFo8Z1t736NVFdm33kSYq3d8aCaFb2HpGR8Y4DSf5Xfjcxjom-cP04c0gupbVoRMpRPIwQGKcVlElt1TdH9ZrHLHnB0hWT7XO4qntCiX9borKuvuxlTIfWS03Qee_G58IWo0ZPhlTmh7FsypTg"
            />
            <span className="text-2xl font-bold tracking-tighter font-headline text-slate-200">Versa</span>
          </div>
        </div>
        <button 
          onClick={togglePause}
          className="px-6 py-2 rounded-full bg-surface-container-high border border-outline/20 text-on-surface text-sm font-semibold tracking-wide hover:opacity-80 transition-opacity"
        >
          {isPaused ? 'Resume' : 'Pause'}
        </button>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-24 pb-32 max-w-lg mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-headline text-on-surface-variant text-sm uppercase tracking-[0.2em] mb-4">Current Practice</h2>
          <p className="text-2xl font-medium leading-relaxed font-body">
            Gently massage your partner's shoulders, focusing on slow, rhythmic movements.
          </p>
        </div>

        <div className="relative flex items-center justify-center w-72 h-72 mb-16">
          {!isPaused && <div className="absolute inset-0 rounded-full border border-primary/10 animate-pulse"></div>}
          <div className="absolute inset-4 rounded-full border border-secondary/20 glow-border"></div>
          
          <div className="flex flex-col items-center">
            <span className="font-headline text-7xl font-extrabold tracking-tighter text-on-surface drop-shadow-2xl">
              {formatTime(timeLeft)}
            </span>
            <span className="text-tertiary font-semibold tracking-[0.3em] uppercase text-[10px] mt-2">Remaining</span>
          </div>
          
          <div className="absolute -z-10 w-full h-full bg-primary/5 rounded-full blur-3xl"></div>
        </div>

        <div className="w-full h-1 bg-surface-container-highest rounded-full mb-12 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        <div className="w-full flex flex-col items-center gap-8">
          <button 
            onClick={handleStop}
            className="group relative flex flex-col items-center justify-center w-32 h-32 rounded-full transition-all duration-300 active:scale-95"
          >
            <div className="absolute inset-0 bg-error-dim rounded-full shadow-[0_0_40px_rgba(215,51,87,0.4)] transition-all group-hover:shadow-[0_0_60px_rgba(215,51,87,0.6)]"></div>
            <div className="relative flex flex-col items-center text-on-error">
              <span className="material-symbols-outlined text-4xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>front_hand</span>
              <span className="font-headline font-extrabold text-sm tracking-widest">STOP</span>
            </div>
          </button>
          <p className="text-on-surface-variant text-xs font-medium text-center max-w-[240px] leading-relaxed opacity-60">
            Tap STOP at any time to immediately end the session. Your comfort is our priority.
          </p>
        </div>
      </main>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6">
        <button className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined">skip_previous</span>
        </button>
        <button 
          onClick={togglePause}
          className="w-20 h-20 rounded-full bg-gradient-to-br from-secondary to-secondary-dim flex items-center justify-center text-on-secondary shadow-[0_10px_30px_rgba(255,152,0,0.3)] hover:scale-105 transition-transform"
        >
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            {isPaused ? 'play_arrow' : 'pause'}
          </span>
        </button>
        <button className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface hover:bg-surface-container-highest transition-colors">
          <span className="material-symbols-outlined">skip_next</span>
        </button>
      </div>

      <div className="fixed bottom-0 left-0 w-full h-[265px] -z-10 opacity-30 pointer-events-none">
        <div className="w-full h-full bg-gradient-to-t from-surface to-transparent"></div>
        <img
          alt="Fluid Background"
          className="absolute bottom-[-10%] left-[-10%] w-[120%] h-full object-cover blur-2xl"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDxByaacUfID_GrdDRltkIqhx66s8Y5_aURkY69BgiudUZDpxe_4wKAALuFv4hjgNF9FyeG0yGPRGvegK7GiZJ4SAPmkpcdfvPkNXUKNJIF-9biq0DFnQYOpHOX1scCz6lsiPqADk9VveWa4ropixZL01ZjjU3ediagXw6FfB1Si-x2tjibXMKJKJ38ux-PGhhXWz8B6CtjD6YHN1tPRHEywRvcF4zXPEOvC8L4rvBN0Q4DUJxj1jttzz09wDICQapAU1u65hmidxg"
        />
      </div>
    </div>
  );
};

export default ActiveDateNight;
