import React, { useState } from 'react';
import { API } from '../apiBase';

export default function IntakeForm() {
  const [form, setForm] = useState({
    fullName:'', patientId:'', dob:'', email:'',
    symptoms:'', medicalHistory:'', documentsList:'', notes:''
  });
  const [msg, setMsg] = useState('');

  const set = (k,v)=>setForm(s=>({...s,[k]:v}));

  const submit = async (e)=>{
    e.preventDefault(); setMsg('');
    try{
      const r = await fetch(`${API}/api/intake`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(form)
      });
      const j = await r.json();
      if(j.success){
        setMsg('✅ Submitted');
        setForm({ fullName:'', patientId:'', dob:'', email:'', symptoms:'', medicalHistory:'', documentsList:'', notes:'' });
      } else setMsg('❌ Failed');
    }catch{ setMsg('❌ Failed'); }
  };

  return (
    <div className="card">
      <div className="card-hd"><h2 className="card-title">Patient Intake</h2></div>
      <div className="card-bd">
        <form onSubmit={submit} className="space-y-8">
          <section>
            <h3 className="text-slate-700 font-semibold mb-3">Section 1 – Patient Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-sm text-slate-700">Full Name</label><input className="input" value={form.fullName} onChange={e=>set('fullName',e.target.value)} required/></div>
              <div><label className="text-sm text-slate-700">Patient ID</label><input className="input" value={form.patientId} onChange={e=>set('patientId',e.target.value)} /></div>
              <div><label className="text-sm text-slate-700">Date of Birth</label><input className="input" type="date" value={form.dob} onChange={e=>set('dob',e.target.value)} /></div>
              <div><label className="text-sm text-slate-700">Email</label><input className="input" type="email" value={form.email} onChange={e=>set('email',e.target.value)} /></div>
            </div>
          </section>

          <section>
            <h3 className="text-slate-700 font-semibold mb-3">Section 2 – Clinical Information</h3>
            <div className="space-y-4">
              <div><label className="text-sm text-slate-700">1) Symptoms</label><textarea className="textarea" value={form.symptoms} onChange={e=>set('symptoms',e.target.value)} /></div>
              <div><label className="text-sm text-slate-700">2) Medical History</label><textarea className="textarea" value={form.medicalHistory} onChange={e=>set('medicalHistory',e.target.value)} /></div>
              <div><label className="text-sm text-slate-700">3) Medical Documents & Imaging (one per line: Description - https://url)</label><textarea className="textarea" placeholder="Echo report - https://..." value={form.documentsList} onChange={e=>set('documentsList',e.target.value)} /></div>
              <div><label className="text-sm text-slate-700">4) Notes</label><textarea className="textarea" value={form.notes} onChange={e=>set('notes',e.target.value)} /></div>
            </div>
          </section>

          <div className="flex justify-end">
            <button className="btn" type="submit">Submit Intake</button>
            {msg && <span className="ml-3 badge">{msg}</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
