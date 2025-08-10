import React, { useState } from 'react';
import IntakeForm from './IntakeForm.jsx';
import MedicalDashboard from './MedicalDashboard.jsx';

export default function App() {
  const [view, setView] = useState('form');
  const [admin, setAdmin] = useState(false);

  const login = () => {
    const pwd = prompt('Enter admin password:');
    if (!pwd) return;
    localStorage.setItem('admin_password', pwd);
    setAdmin(true);
    setView('admin');
  };
  const logout = () => {
    localStorage.removeItem('admin_password');
    setAdmin(false);
    setView('form');
  };

  return (
    <div>
      <nav className="nav">
        <div className="max-w-6xl mx-auto flex items-center gap-3 p-3">
          <button className="navbtn" onClick={() => setView('form')}>Intake Form</button>
          <button className="navbtn" onClick={() => admin ? setView('admin') : login()}>Medical Dashboard</button>
          {admin && <button className="navbtn ml-auto" onClick={logout}>Logout</button>}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-4">
        {view === 'form' && <IntakeForm />}
        {view === 'admin' && <MedicalDashboard />}
      </main>
    </div>
  );
}