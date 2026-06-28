import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('versa_token');
    localStorage.removeItem('versa_pairing_id');
    localStorage.removeItem('versa_user_email');
    navigate('/');
  };

  const navItems = [
    { path: '/compass', label: 'Compass', icon: 'explore' },
    { path: '/match', label: 'Dashboard', icon: 'dashboard' },
    { path: '/date', label: 'Practice', icon: 'spa' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0e0e0e]/80 backdrop-blur-xl border-t border-outline-variant/10 px-6 py-3 pb-safe-bottom flex justify-around items-center max-w-lg mx-auto rounded-t-2xl shadow-[0_-8px_30px_rgb(0,0,0,0.4)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all duration-200 active:scale-90 relative"
          >
            <span
              className={`material-symbols-outlined text-2xl transition-colors duration-200 ${
                isActive
                  ? 'text-[#f183ff] drop-shadow-[0_0_8px_rgba(241,131,255,0.4)]'
                  : 'text-on-surface-variant/60 hover:text-on-surface-variant'
              }`}
            >
              {item.icon}
            </span>
            <span
              className={`text-[10px] font-medium tracking-wider font-label transition-colors duration-200 ${
                isActive ? 'text-on-surface font-semibold' : 'text-on-surface-variant/50'
              }`}
            >
              {item.label}
            </span>
            {isActive && (
              <span className="absolute bottom-0 w-5 h-0.5 bg-gradient-to-r from-primary to-primary-container rounded-full"></span>
            )}
          </button>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex flex-col items-center justify-center gap-1 py-1 px-4 rounded-xl transition-all duration-200 active:scale-90 text-on-surface-variant/60 hover:text-error"
      >
        <span className="material-symbols-outlined text-2xl">logout</span>
        <span className="text-[10px] font-medium tracking-wider font-label">Exit</span>
      </button>
    </nav>
  );
};

export default BottomNavBar;
