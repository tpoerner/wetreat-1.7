import React, { useEffect, useState } from 'react';
import { API } from './apiBase';

export default function MedicalDashboard() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [dir, setDir] = useState('DESC');
  const [edit, setEdit] = useState(null);

  const pwd = localStorage.getItem('admin_password') || '';

  const load = async () => {
    const qs = new URLSearchParams({ search, sort, dir }).toString();
    const res = await fetch(`${API}/api/patients?` + qs, { headers: { 'X-Admin-Password': pwd } });
    if (res.status === 401) { alert('Unauthorized. Click Medical Dashboard and enter password again.'); return; }
    setRows(await res.json());
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sort, dir]);

  const saveConsult = async () => {
    const res = await fetch(`${API}/api/patients/` + edit.id + '/consultation', {
      method: 'PUT',
      headers: { 'Content-Type':'application/json', 'X-Admin-Password': pwd },
      body: JSON.stringify({
        physicianName: edit.physicianName,
        physicianEmail: edit.physicianEmail,
        recommendations: edit.recommendations
      })
    });
    if (res.ok) {
      const { consultationTimestamp } = await res.json();
      setEdit(null);
      load();
      alert('Saved. Timestamp: ' + new Date(consultationTimestamp).toLocaleString());
    }
  };

  const del = async (id) => {
    if (!confirm('Delete this record?')) return;
    await fetch(`${API}/api/patients/` + id, { method:'DELETE', headers: { 'X-Admin-Password': pwd } });
    load();
  };

  const downloadPdf = async (id) => {
    const r = await fetch(`${API}/api/patients/` + id + '/report', { headers: { 'X-Admin-Password': pwd } });
    if (!r.ok) return alert('Failed to generate PDF');
    const blob = await r.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'patient_' + id + '_report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const links = (s) => (s||'').split('\n').map(x=>x.trim()).filter(Boolean).map((line,i)=>{
    const [desc, url] = line.split(' - ');
    return <div key={i} className="text-sm"><span className="font-medium">{desc || 'Document'}</span>: <a className="link" href={url || '#'} target="_blank" rel="noreferrer">{url}</a></div>;
  });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={load}>Search</button>
        <div className="ml-auto flex items-center gap-2">
          <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="createdAt">Date Created</option>
            <option value="fullName">Name</option>
            <option value="patientId">Patient ID</option>
            <option value="dob">DOB</option>
            <option value="email">Email</option>
            <option value="consultationTimestamp">Consultation Time</option>
          </select>
          <select className="input" value={dir} onChange={e=>setDir(e.target.value)}>
            <option value="DESC">Desc</option>
            <option value="ASC">Asc</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-slate-100">
            <tr>
              <th className="th">ID</th>
              <th className="th">Created</th>
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">DOB</th>
              <th className="th">Patient ID</th>
              <th className="th">Symptoms</th>
              <th className="th">History</th>
              <th className="th">Med Docs & Imaging</th>
              <th className="th">Notes</th>
              <th className="th">Consultation</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map(r => (
              <tr key={r.id}>
                <td className="td">{r.id}</td>
                <td className="td">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="td">{r.fullName}</td>
                <td className="td">{r.email}</td>
                <td className="td">{r.dob}</td>
                <td className="td">{r.patientId}</td>
                <td className="td">{r.symptoms}</td>
                <td className="td">{r.medicalHistory}</td>
                <td className="td">{links(r.documentsList)}</td>
                <td className="td">{r.notes}</td>
                <td className="td">
                  <div className="space-y-1 text-sm">
                    <div><b>Name:</b> {r.physicianName || '—'}</div>
                    <div><b>Email:</b> {r.physicianEmail || '—'}</div>
                    <div><b>Time:</b> {r.consultationTimestamp ? new Date(r.consultationTimestamp).toLocaleString() : '—'}</div>
                    <div><b>Recs:</b> {r.recommendations || '—'}</div>
                  </div>
                </td>
                <td className="td">
                  <div className="flex flex-col gap-2">
                    <button className="btn" onClick={()=>setEdit(r)}>Edit</button>
                    <button className="btn" onClick={()=>downloadPdf(r.id)}>PDF</button>
                    <button className="btn" style={{background:'#b91c1c'}} onClick={()=>del(r.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length===0 && <tr><td className="td" colSpan="12">No records.</td></tr>}
          </tbody>
        </table>
      </div>

      {edit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="card w-full max-w-2xl">
            <h3 className="text-lg font-semibold mb-3">Edit Consultation for #{edit.id}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input label="Physician's Name"  val={edit.physicianName}  onChange={v=>setEdit({...edit, physicianName:v})} />
              <Input label="Physician's Email" val={edit.physicianEmail} onChange={v=>setEdit({...edit, physicianEmail:v})} />
              <Area  label="Recommendations" className="md:col-span-2" val={edit.recommendations} onChange={v=>setEdit({...edit, recommendations:v})} />
            </div>
            <div className="mt-4 flex gap-2">
              <button className="btn" onClick={saveConsult}>Save</button>
              <button className="btn" style={{background:'#6b7280'}} onClick={()=>setEdit(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Input({label, val, onChange, type='text', className=''}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <input className="input" type={type} value={val || ''} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
function Area({label, val, onChange, className=''}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      <textarea className="textarea" value={val || ''} onChange={e=>onChange(e.target.value)} />
    </div>
  );
}
