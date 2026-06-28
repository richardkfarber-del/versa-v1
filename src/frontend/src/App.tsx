import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import ConnectionCompass from './pages/ConnectionCompass';
import MatchReveal from './pages/MatchReveal';
import ActiveDateNight from './pages/ActiveDateNight';
import Grounding from './pages/Grounding';
import BottomNavBar from './components/BottomNavBar';

const AppContent: React.FC = () => {
  const location = useLocation();
  const showNav = location.pathname !== '/' && location.pathname !== '/grounding';

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/compass" element={<ConnectionCompass />} />
        <Route path="/match" element={<MatchReveal />} />
        <Route path="/date" element={<ActiveDateNight />} />
        <Route path="/grounding" element={<Grounding />} />
      </Routes>
      {showNav && <BottomNavBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;