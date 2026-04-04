import React from 'react';
import ActiveDateNight from './ActiveDateNight';
import ConnectionCompass from './ConnectionCompass';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>
      <ActiveDateNight />
      <ConnectionCompass />
      {/* Additional dashboard content can go here */}
    </div>
  );
};

export default Dashboard;
