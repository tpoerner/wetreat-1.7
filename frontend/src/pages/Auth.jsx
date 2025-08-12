import React, { useState } from "react";

export default function Auth({ onEnter }) {
  const [mode, setMode] = useState("");       // "patient" | "doctor" | "admin"
  const [password, setPassword] = useState(""); // for doctor/admin only
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const proceed = () => {
    if (mode === "patient") {
      // Clear any previous auth
      localStorage.removeItem("role");
      localStorage.removeItem("admin_password");
      localStorage.removeItem("admin_name");
      localStorage.removeItem("admin_email");
      localStorage.setItem("role", "patient");
      onEnter("intake");
      return;
    }
    // doctor/admin share the same backend password for now
    if (!password) { alert("Please enter the password"); return; }
    localStorage.setItem("role", mode);
    localStorage.setItem("admin_password", password);
    if (name)  localStorage.setItem("admin_name", name);
    if (email) localStorage.setItem("admin_email", email);
    onEnter("dashboard");  // both doctor and admin land in Medical Dashboard
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-xl bg-white shadow rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">Welcome to WeTreat</h1>
        <p className="text-slate-600 mb-6">Choose your role to continue.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <button
            onClick={()=>setMode("patient")}
            className={`px-4 py-3 rounded-lg border ${mode==="patient" ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}
          >
            Patient Input
          </button>
          <button
            onClick={()=>setMode("doctor")}
            className={`px-4 py-3 rounded-lg border ${mode==="doctor" ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}
          >
            Medical Consultation
          </button>
          <button
            onClick={()=>setMode("admin")}
            className={`px-4 py-3 rounded-lg border ${mode==="admin" ? "border-blue-600 bg-blue-50" : "border-slate-300 hover:bg-slate-50"}`}
          >
            Admin Tasks
          </button>
        </div>

        {/* Doctor/Admin fields */}
        {(mode === "doctor" || mode === "admin") && (
          <div className="space-y-3 mb-4">
            <div>
              <label className="block text-sm text-slate-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full border border-slate-300 rounded-md px-3 py-2"
                placeholder="Enter password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-700 mb-1">Your Name (optional)</label>
                <input className="w-full border border-slate-300 rounded-md px-3 py-2" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Your Email (optional)</label>
                <input type="email" className="w-full border border-slate-300 rounded-md px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              For now, Admin and Doctor share the same access. We’ll add fine‑grained permissions later.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={proceed}
            disabled={!mode}
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
