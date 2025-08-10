import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import IntakeForm from './pages/IntakeForm.jsx';
import MedicalDashboard from './pages/MedicalDashboard.jsx';

export default function App() {
  const [view, setView] = useState('intake');
  const [admin, setAdmin] = useState(!!localStorage.getItem('admin_password'));

  const onLogin = () => {
    const pwd = prompt('Admin password:');
    if (!pwd) return;
    const name = prompt('Your name (for consultation header):') || '';
    const email = prompt('Your email:') || '';
    localStorage.setItem('admin_password', pwd);
    if (name) localStorage.setItem('admin_name', name);
    if (email) localStorage.setItem('admin_email', email);
    setAdmin(true);
    setView('dashboard');
  };
  const onLogout = () => {
    localStorage.removeItem('admin_password');
    localStorage.removeItem('admin_name');
    localStorage.removeItem('admin_email');
    setAdmin(false);
    setView('intake');
  };

  return (
    <div className="min-h-screen">
      <Navbar onNavigate={setView} admin={admin} onLogin={onLogin} onLogout={onLogout} />
      <div className="container py-6">
        {view === 'intake' && <IntakeForm />}
        {view === 'dashboard' && <MedicalDashboard />}
      </div>
    </div>
  );
}
