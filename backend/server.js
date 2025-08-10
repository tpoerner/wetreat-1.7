import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme';
const ADMIN_NAME = process.env.ADMIN_NAME || '';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

app.use(cors());
app.use(express.json());

// DB in /tmp for Hobby tier
const dbPath = '/tmp/wetreat.sqlite';
let db;

async function initDb() {
  db = await open({ filename: dbPath, driver: sqlite3.Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fullName TEXT,
      email TEXT,
      dob TEXT,
      patientId TEXT,
      symptoms TEXT,
      medicalHistory TEXT,
      documentsList TEXT,  -- "Desc - URL" per line
      notes TEXT,
      physicianName TEXT,
      physicianEmail TEXT,
      consultationTimestamp TEXT,
      recommendations TEXT,
      createdAt TEXT
    )
  `);
  const c = await db.get('SELECT COUNT(*) as c FROM patients');
  if (c.c === 0) {
    const now = new Date().toISOString();
    await db.run(`INSERT INTO patients
      (fullName,email,dob,patientId,symptoms,medicalHistory,documentsList,notes,physicianName,physicianEmail,consultationTimestamp,recommendations,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        'John Doe','john.doe@example.com','1963-04-12','JD-6201',
        'Exertional chest pain, dyspnea on exertion.',
        'CAD with prior PCI (2018). HTN. Dyslipidemia. Smoker (quit 2019).',
        'Stress echo (positive) - https://example.com/stress-echo\nCoronary CTA - https://example.com/cta',
        'Increased chest discomfort last 2 weeks.',
        'Dr. Alex Rivera','alex.rivera@clinic.org', new Date().toISOString(),
        'Continue DAPT; optimize statin; schedule functional testing in 3 months.',
        now
      ]);
    await db.run(`INSERT INTO patients
      (fullName,email,dob,patientId,symptoms,medicalHistory,documentsList,notes,physicianName,physicianEmail,consultationTimestamp,recommendations,createdAt)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`, [
        'Jane Smith','jane.smith@example.com','1967-09-03','JS-5812',
        'Fatigue, exertional dyspnea (NYHA II).',
        'Severe mitral regurgitation on echo (2024). T2DM.',
        'Echo report - https://example.com/echo\nCath report - https://example.com/cath',
        'No syncope. Occasional palpitations.',
        'Dr. Maria Chen','maria.chen@heartcenter.org', new Date().toISOString(),
        'Refer to valve team; consider repair; optimize glycemic control.',
        now
      ]);
  }
}

function adminOnly(req,res,next){
  const pass = req.headers['x-admin-password'];
  if (pass && pass === ADMIN_PASSWORD) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

// Intake
app.post('/api/intake', async (req,res)=>{
  try{
    const { fullName='', email='', dob='', patientId='', symptoms='', medicalHistory='', documentsList='', notes='' } = req.body || {};
    const createdAt = new Date().toISOString();
    await db.run(`INSERT INTO patients
      (fullName,email,dob,patientId,symptoms,medicalHistory,documentsList,notes,physicianName,physicianEmail,consultationTimestamp,recommendations,createdAt)
      VALUES (?,?,?,?,?,?,?,?,NULL,NULL,NULL,NULL,?)`,
      [fullName,email,dob,patientId,symptoms,medicalHistory,documentsList,notes,createdAt]);
    res.json({ success:true });
  }catch(e){ console.error(e); res.status(500).json({ success:false }); }
});

// List/search/sort
app.get('/api/patients', adminOnly, async (req,res)=>{
  try{
    const { search='', sort='createdAt', dir='DESC' } = req.query;
    const safeSort = ['id','createdAt','fullName','patientId','dob','email','consultationTimestamp'].includes(sort) ? sort : 'createdAt';
    const safeDir = (dir||'').toUpperCase()==='ASC' ? 'ASC' : 'DESC';
    const like = `%${search}%`;
    const rows = await db.all(`SELECT * FROM patients
      WHERE fullName LIKE ? OR email LIKE ? OR patientId LIKE ? OR symptoms LIKE ? OR medicalHistory LIKE ? OR notes LIKE ? OR documentsList LIKE ? OR physicianName LIKE ? OR physicianEmail LIKE ? OR recommendations LIKE ?
      ORDER BY ${safeSort} ${safeDir}`, [like,like,like,like,like,like,like,like,like,like]);
    res.json(rows);
  }catch(e){ console.error(e); res.status(500).json({ success:false }); }
});

// Update consultation (auto timestamp; pull admin name/email from headers or env)
app.put('/api/patients/:id/consultation', adminOnly, async (req,res)=>{
  try{
    const { id } = req.params;
    let { physicianName='', physicianEmail='', recommendations='' } = req.body || {};
    const headerName = req.headers['x-admin-name'] || ADMIN_NAME;
    const headerEmail = req.headers['x-admin-email'] || ADMIN_EMAIL;
    if (!physicianName) physicianName = headerName;
    if (!physicianEmail) physicianEmail = headerEmail;
    const consultationTimestamp = new Date().toISOString();
    const r = await db.run(`UPDATE patients SET physicianName=?, physicianEmail=?, consultationTimestamp=?, recommendations=? WHERE id=?`,
      [physicianName, physicianEmail, consultationTimestamp, recommendations, id]);
    if (r.changes===0) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true, consultationTimestamp });
  }catch(e){ console.error(e); res.status(500).json({ success:false }); }
});

// Delete
app.delete('/api/patients/:id', adminOnly, async (req,res)=>{
  try{
    const r = await db.run('DELETE FROM patients WHERE id=?', [req.params.id]);
    if (r.changes===0) return res.status(404).json({ success:false, message:'Not found' });
    res.json({ success:true });
  }catch(e){ console.error(e); res.status(500).json({ success:false }); }
});

// PDF (A4, small logo top-right if PNG exists, clickable URLs)
app.get('/api/patients/:id/report', adminOnly, async (req,res)=>{
  try{
    const row = await db.get('SELECT * FROM patients WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).send('Not found');

    const logoPng = path.join(__dirname, 'assets', 'logo.png'); // optional
    const doc = new PDFDocument({ size:'A4', margins:{ top:50,left:50,right:50,bottom:50 } });
    res.setHeader('Content-Type','application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=patient_${row.id}_report.pdf`);
    doc.pipe(res);

    if (fs.existsSync(logoPng)) {
      try { doc.image(logoPng, 500, 35, { fit:[60,40], align:'right' }); } catch {}
    }
    doc.moveTo(50, 90).lineTo(545, 90).stroke();

    const section = (t)=>{ doc.moveDown(1); doc.fontSize(13).text(t, { underline:true }); doc.moveDown(0.3); doc.fontSize(11); };
    const field = (k,v)=>{ doc.font('Helvetica-Bold').text(k+': ', {continued:true}); doc.font('Helvetica').text(v||'—'); };

    section('Patient Demographics');
    field('Full Name', row.fullName);
    field('Patient ID', row.patientId);
    field('Date of Birth', row.dob);
    field('Email', row.email);
    field('Created At', new Date(row.createdAt).toLocaleString());

    section('Clinical Information');
    field('Symptoms', row.symptoms);
    field('Medical History', row.medicalHistory);
    doc.font('Helvetica-Bold').text('Medical Documents & Imaging:');
    const lines = (row.documentsList||'').split('\n').map(s=>s.trim()).filter(Boolean);
    if (lines.length){
      doc.font('Helvetica');
      lines.forEach(line=>{
        const [desc,url] = line.split(' - ');
        const d = desc || 'Document';
        if (url) {
          doc.text('• '+d+': ', {continued:true});
          doc.fillColor('blue').text(url, { link:url, underline:true });
          doc.fillColor('black');
        } else {
          doc.text('• '+(desc||line));
        }
      });
    } else {
      doc.font('Helvetica').text('—');
    }
    field('Notes', row.notes);

    section('Consultation');
    field('Physician Name', row.physicianName);
    field('Physician Email', row.physicianEmail);
    field('Timestamp', row.consultationTimestamp ? new Date(row.consultationTimestamp).toLocaleString() : '');
    field('Recommendations', row.recommendations);

    doc.end();
  }catch(e){ console.error(e); res.status(500).send('Failed to generate report'); }
});

app.get('/api/health', (_req,res)=>res.json({ ok:true, dbPath }));

initDb().then(()=> app.listen(PORT, ()=>console.log(`✅ Backend on ${PORT}; DB at ${dbPath}`)))
       .catch(err=>{ console.error('DB init failed:', err); process.exit(1); });
