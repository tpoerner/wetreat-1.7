import React from 'react';

export default function Navbar({ role, onNavigate, onLogout }) {
  return (
    <nav className="bg-blue-900 text-white">
      <div className="max-w-7xl mx-auto flex items-center gap-3 py-3 px-4">
        <div className="text-xl font-semibold">WeTreat</div>
        <button className="px-3 py-2 rounded-md hover:bg-blue-800" onClick={()=>onNavigate('intake')}>Intake Form</button>
        <button className="px-3 py-2 rounded-md hover:bg-blue-800" onClick={()=>onNavigate('dashboard')}>Medical Dashboard</button>
        <div className="ml-auto flex items-center gap-3">
          {role && <span className="text-sm bg-blue-800 px-2 py-1 rounded">{role}</span>}
          <button className="px-3 py-2 rounded-md bg-white text-blue-900 hover:bg-slate-100" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
