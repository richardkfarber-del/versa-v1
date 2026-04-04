import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRegistration } from '../api';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await submitRegistration(email, password);
      if (result) {
        // Save user ID to local storage or context (mocking this)
        localStorage.setItem('versa_user_id', 'partnerA_123'); 
        navigate('/compass'); // Redirect to next step
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 z-0 bg-mesh pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-secondary/5 blur-[100px] rounded-full"></div>

      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen">
        <img
          className="w-full h-full object-cover grayscale brightness-50"
          alt="abstract background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKy6LWwXHhBl32nucbnbCifQyNAOnIjk69TFL5R5S0mty08EFKLMpv5QeuQn_QpPVgvnNjLoIkazhwVInoN1OjJVcpzvvNiK4SDoNoY-azYaQES7-UfR_ohfBED9_YPeTylF23jHJto0BY0py_xFfVL9bO5LexfhgY6WRel60Ovs2ejV5QrajX22s-E0rPOsrTC2Am66ZWcZHKfbHZQaw1OmkuO_iRmMCf5ZyGOstYe7-bnPU-57F8Zwy9b7UZ53ipFYcCxI145r8"
        />
      </div>

      <main className="relative z-10 flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-[480px]">
          <div className="text-center mb-10">
            <img
              alt="Versa Logo"
              className="h-12 mx-auto mb-6 drop-shadow-2xl"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD0VT1UYovlWGYaSrfsfbi_pUjIK093EyV-v7G-RFghKm1s7pcDibMVsM_BpC50SVoIMMHyrax6xaTkVxfmRN8SXmfgqUTtMLIauRxKqkkrb0NRXlG8cUW0bD1dLB5uEwgxJjR1oQWlj-Y2VuXYfiHrJoFBpeL9E2ut_uHFSh8zxhDTljyhitl6KE1tp7I2becu5rPc13UybEG4lse0RbaiUkIuETlC7MNR5Jkmm3HpWMDVYV0dIQMkEuJRRzqhH4rt3XGfM54XmY"
            />
          </div>

          <div className="bg-surface-container-low/80 backdrop-blur-2xl rounded-[2.75rem] p-10 md:p-12 shadow-2xl border border-outline-variant/10">
            <div className="mb-10 text-center">
              <h1 className="font-headline text-3xl md:text-4xl font-extrabold tracking-tight text-on-background mb-3 glow-text">
                Create Your Sanctuary
              </h1>
              <p className="text-on-surface-variant font-medium tracking-wide">
                Begin your journey to radiant well-being.
              </p>
            </div>

            {error && (
              <div className="bg-error/10 text-error p-3 rounded-lg text-sm mb-6 text-center font-bold">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-outline pl-1" htmlFor="email">
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                    id="email"
                    placeholder="name@sanctuary.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/30 group-focus-within:text-primary transition-colors">
                    mail
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-outline pl-1" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                    id="password"
                    placeholder="••••••••"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/30 group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-outline pl-1" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    className="w-full bg-surface-container-lowest border-none rounded-xl py-4 px-5 text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                    id="confirm-password"
                    placeholder="••••••••"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline/30 group-focus-within:text-primary transition-colors">
                    verified_user
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  className="w-full bg-gradient-to-r from-secondary to-secondary-dim hover:to-primary text-on-secondary font-bold py-5 rounded-xl text-lg shadow-lg shadow-secondary/20 hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                  type="submit"
                  disabled={loading}
                >
                  <span>{loading ? 'Creating Sanctuary...' : 'Sign Up'}</span>
                  {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 pt-2">
                <span className="material-symbols-outlined text-tertiary-dim text-sm">encrypted</span>
                <p className="text-xs text-on-tertiary-fixed-variant font-medium">Your connection is encrypted and safe.</p>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-outline-variant/10 text-center">
              <p className="text-on-surface-variant text-sm">
                Already have an account?
                <a className="text-primary font-bold hover:text-primary-fixed ml-1 transition-colors" href="#">
                  Sign In
                </a>
              </p>
            </div>
          </div>

          <nav className="mt-12 flex justify-center gap-8">
            <a className="text-outline text-xs font-semibold hover:text-on-surface transition-colors tracking-widest uppercase" href="#">
              Privacy Policy
            </a>
            <a className="text-outline text-xs font-semibold hover:text-on-surface transition-colors tracking-widest uppercase" href="#">
              Terms
            </a>
            <a className="text-outline text-xs font-semibold hover:text-on-surface transition-colors tracking-widest uppercase" href="#">
              Support
            </a>
          </nav>
        </div>
      </main>

      <footer className="w-full py-12 border-t border-[#484847]/20 z-10 bg-[#0e0e0e]">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 max-w-7xl mx-auto gap-6">
          <div className="text-lg font-bold text-[#fcf9f8] font-headline tracking-tighter">Versa</div>
          <p className="font-['Plus_Jakarta_Sans'] text-sm tracking-wide text-[#767575] text-center md:text-left">
            © 2024 Versa. All rights reserved. Your Radiant Sanctuary.
          </p>
          <div className="flex gap-6">
            <span className="material-symbols-outlined text-[#767575] cursor-pointer hover:text-[#b8ffbb] transition-colors">share</span>
            <span className="material-symbols-outlined text-[#767575] cursor-pointer hover:text-[#b8ffbb] transition-colors">language</span>
            <span className="material-symbols-outlined text-[#767575] cursor-pointer hover:text-[#b8ffbb] transition-colors">eco</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Register;
