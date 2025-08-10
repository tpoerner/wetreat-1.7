import React from 'react';

export default function Navbar({ onNavigate, admin, onLogin, onLogout }) {
  return (
    <nav className="nav">
      <div className="container flex items-center gap-3 py-3">
        <div className="text-xl font-semibold">WeTreat</div>
        <button className="nav-btn" onClick={() => onNavigate('intake')}>Intake Form</button>
        <button className="nav-btn" onClick={() => onNavigate('dashboard')}>Medical Dashboard</button>
        <div className="ml-auto flex items-center gap-2">
          {!admin ? (
            <button className="btn-ghost" onClick={onLogin}>Admin Login</button>
          ) : (
            <button className="btn-ghost" onClick={onLogout}>Logout</button>
          )}
        </div>
      </div>
    </nav>
  );
}
