import React, { useEffect, useState } from 'react';
import Navbar from './components/Navbar.jsx';
import IntakeForm from './pages/IntakeForm.jsx';
import MedicalDashboard from './pages/MedicalDashboard.jsx';
import Auth from './pages/Auth.jsx';

export default function App() {
  const [view, setView] = useState('auth'); // start at auth
  const [role, setRole] = useState(localStorage.getItem('role') || '');

  useEffect(()=>{ setRole(localStorage.getItem('role') || ''); }, [view]);

  const handleEnter = (nextView) => {
    setRole(localStorage.getItem('role') || '');
    setView(nextView);
  };

  const logout = () => {
    localStorage.clear();
    setRole('');
    setView('auth');
  };

  // Hide navbar on auth screen for a clean first impression
  return (
    <div className="min-h-screen bg-slate-100">
      {view !== 'auth' && (
        <Navbar
          role={role}
          onNavigate={(v)=>setView(v)}
          onLogout={logout}
        />
      )}
      <div className="max-w-7xl mx-auto p-6">
        {view === 'auth'     && <Auth onEnter={handleEnter} />}
        {view === 'intake'   && <IntakeForm />}
        {view === 'dashboard'&& <MedicalDashboard />}
      </div>
    </div>
  );
}
