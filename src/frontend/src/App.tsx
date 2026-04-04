import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import ConnectionCompass from './pages/ConnectionCompass';
import MatchReveal from './pages/MatchReveal';
import ActiveDateNight from './pages/ActiveDateNight';
import Grounding from './pages/Grounding';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/compass" element={<ConnectionCompass />} />
        <Route path="/match" element={<MatchReveal />} />
        <Route path="/date" element={<ActiveDateNight />} />
        <Route path="/grounding" element={<Grounding />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;