import React, { useEffect, useState } from 'react';
import { API } from '../apiBase';

export default function MedicalDashboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [dir, setDir] = useState('DESC');
  const [edit, setEdit] = useState(null);

  const pwd = localStorage.getItem('admin_password') || '';
  const adminName = localStorage.getItem('admin_name') || '';
  const adminEmail = localStorage.getItem('admin_email') || '';

  const load = async () => {
    const qs = new URLSearchParams({ search, sort, dir }).toString();
    const r = await fetch(`${API}/api/patients?` + qs, { headers: { 'X-Admin-Password': pwd } });
    if (r.status === 401) { alert('Unauthorized. Click Admin Login in the top bar.'); return; }
    setRows(await r.json());
  };
  useEffect(()=>{ load(); /* eslint-disable-next-line */ }, [sort, dir]);

  const saveConsult = async () => {
    const r = await fetch(`${API}/api/patients/${edit.id}/consultation`, {
      method:'PUT',
      headers:{
        'Content-Type':'application/json',
        'X-Admin-Password': pwd,
        'X-Admin-Name': adminName,
        'X-Admin-Email': adminEmail
      },
      body: JSON.stringify({
        physicianName: edit.physicianName || adminName,
        physicianEmail: edit.physicianEmail || adminEmail,
        diagnosis: edit.diagnosis || '',            // << NEW
        recommendations: edit.recommendations || ''
      })
    });
    if (r.ok) {
      const j = await r.json();
      alert('Saved. Timestamp: ' + new Date(j.consultationTimestamp).toLocaleString());
      setEdit(null); load();
    } else alert('Failed to save');
  };

  const del = async (id) => {
    if (!confirm('Delete this record?')) return;
    await fetch(`${API}/api/patients/${id}`, { method:'DELETE', headers:{ 'X-Admin-Password': pwd } });
    load();
  };

  const pdf = async (id) => {
    const r = await fetch(`${API}/api/patients/${id}/report`, { headers:{ 'X-Admin-Password': pwd } });
    if (!r.ok) return alert('Failed to generate PDF');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `patient_${id}_report.pdf`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

  const linkLines = (s)=>(s||'').split('\n').map(l=>l.trim()).filter(Boolean).map((line,i)=>{
    const [desc,url] = line.split(' - ');
    return <div key={i}><span className="font-medium">{desc||'Document'}</span>: <a className="link" href={url||'#'} target="_blank" rel="noreferrer">{url}</a></div>;
  });

  return (
    <div className="card">
      <div className="card-hd">
        <h2 className="card-title">Medical Dashboard</h2>
        <div className="flex items-center gap-2">
          <input className="input w-56" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
          <button className="btn" onClick={load}>Search</button>
          <select className="select" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="createdAt">Created</option>
            <option value="fullName">Name</option>
            <option value="dob">DOB</option>
            <option value="patientId">Patient ID</option>
            <option value="consultationTimestamp">Consultation Time</option>
          </select>
          <select className="select" value={dir} onChange={e=>setDir(e.target.value)}>
            <option value="DESC">Desc</option>
            <option value="ASC">Asc</option>
          </select>
        </div>
      </div>

      <div className="card-bd">
        <div className="overflow-auto max-h=[65vh]">
          <table className="table">
            <thead>
              <tr>
                {['ID','Created','Name','Email','DOB','Patient ID','Symptoms','History','Medical Docs & Imaging','Notes','Consultation','Actions'].map(h=>(<th key={h} className="th">{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {rows.map(r=>(
                <tr key={r.id} className="tr">
                  <td className="td">{r.id}</td>
                  <td className="td">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="td">{r.fullName}</td>
                  <td className="td">{r.email}</td>
                  <td className="td">{r.dob}</td>
                  <td className="td">{r.patientId}</td>
                  <td className="td">{r.symptoms}</td>
                  <td className="td">{r.medicalHistory}</td>
                  <td className="td">{linkLines(r.documentsList)}</td>
                  <td className="td">{r.notes}</td>
                  <td className="td">
                    <div className="text-sm space-y-1">
                      <div><b>Name:</b> {r.physicianName||'—'}</div>
                      <div><b>Email:</b> {r.physicianEmail||'—'}</div>
                      <div><b>Time:</b> {r.consultationTimestamp? new Date(r.consultationTimestamp).toLocaleString():'—'}</div>
                      <div><b>Diagnosis:</b> {r.diagnosis||'—'}</div>          {/* << NEW in table */}
                      <div><b>Recs:</b> {r.recommendations||'—'}</div>
                    </div>
                  </td>
                  <td className="td">
                    <div className="flex flex-col gap-2">
                      <button className="btn" onClick={()=>setEdit(r)}>Edit</button>
                      <button className="btn" onClick={()=>pdf(r.id)}>PDF</button>
                      <button className="btn-danger" onClick={()=>del(r.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length===0 && <tr><td className="td" colSpan="12">No records.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-2xl">
            <div className="card-hd"><div className="card-title">Edit Consultation for #{edit.id}</div></div>
            <div className="card-bd">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-700">Physician's Name</label>
                  <input className="input" value={edit.physicianName||adminName} onChange={e=>setEdit({...edit, physicianName:e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-slate-700">Physician's Email</label>
                  <input className="input" type="email" value={edit.physicianEmail||adminEmail} onChange={e=>setEdit({...edit, physicianEmail:e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-slate-700">Diagnosis</label>     {/* << NEW field */}
                  <textarea className="textarea" value={edit.diagnosis||''} onChange={e=>setEdit({...edit, diagnosis:e.target.value})} />
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm text-slate-700">Recommendations</label>
                  <textarea className="textarea" value={edit.recommendations||''} onChange={e=>setEdit({...edit, recommendations:e.target.value})} />
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="btn" onClick={saveConsult}>Save</button>
                <button className="btn-ghost" onClick={()=>setEdit(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
