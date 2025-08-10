// Set in Render: VITE_API_BASE=https://<your-backend>.onrender.com
export const API = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');
