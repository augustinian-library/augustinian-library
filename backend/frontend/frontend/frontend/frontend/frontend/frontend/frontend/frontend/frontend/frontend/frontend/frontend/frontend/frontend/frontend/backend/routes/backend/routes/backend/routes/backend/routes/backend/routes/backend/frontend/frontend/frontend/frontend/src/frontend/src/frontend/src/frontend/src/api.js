const API_BASE = import.meta.env.VITE_API_BASE || (process.env.REACT_APP_API_BASE || 'http://localhost:5000');

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = localStorage.getItem('ils_token');
  if(token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  const contentType = res.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await res.json() : await res.text();
  if(!res.ok) throw body;
  return body;
}

export const auth = {
  loginAdmin: (username,password) => request('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ username, password }) }),
};

export const books = {
  list: (q='') => request(`/api/books?q=${encodeURIComponent(q)}`),
  create: (data) => request('/api/books', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }),
};

export const dashboard = {
  get: () => request('/api/dashboard')
};

export default { request, auth, books, dashboard };
