// Shared frontend helpers for auth and API calls
// Choose an API base that works both when the page is served and when opened
// directly via file:// for local testing. If the page is file:// we assume a
// local dev server is available at http://localhost:3000 and use that.
const apiBase = (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') ? 'http://localhost:3000/api' : '/api';

async function postJSON(path, body){
  const res = await fetch(apiBase + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  let data;
  try{ data = await res.json(); }catch(e){ data = null; }
  if(!res.ok){ const err = (data && (data.error || data.message)) ? (data.error||data.message) : `Request failed (${res.status})`; const e = new Error(err); e.info = data; throw e; }
  return data;
}

function saveAuth(token, user){
  if(token) localStorage.setItem('authToken', token);
  if(user) localStorage.setItem('authUser', JSON.stringify(user));
}

function clearAuth(){ localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); }

function showMessage(element, msg, isError = true){
  if(!element) return;
  element.textContent = msg || '';
  element.style.color = isError ? '#c00' : '#0a0';
}

// Simple UI helpers
function toggleButtonLoading(btn, isLoading){
  if(!btn) return;
  if(isLoading){ btn.dataset._orig = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid rgba(255,255,255,0.2);border-top-color:rgba(255,255,255,0.9);border-radius:50%;animation:spin 0.9s linear infinite;margin-right:8px"></span>' + (btn.dataset._text || btn.textContent || ''); }
  else { btn.disabled = false; if(btn.dataset._orig) btn.innerHTML = btn.dataset._orig; }
}

function assessPasswordStrength(pw){
  if(!pw) return { score:0, label:'too short' };
  let score = 0;
  if(pw.length >= 8) score += 1;
  if(/[A-Z]/.test(pw)) score += 1;
  if(/[0-9]/.test(pw)) score += 1;
  if(/[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ['very weak','weak','ok','strong','very strong'];
  return { score, label: labels[score] || 'weak' };
}

// tiny spinner CSS injection for the loading icon inside buttons
try{ const s = document.createElement('style'); s.textContent = '@keyframes spin{to{transform:rotate(360deg)}}'; document.head.appendChild(s);}catch(e){}

// Login wrapper — calls /api/users/login and returns the JSON { user, token }
async function loginRequest(email, password){
  return await postJSON('/users/login', { email, password });
}

// Register wrapper — calls /api/users/register and returns the JSON { user, token }
async function registerRequest(name, email, password){
  return await postJSON('/users/register', { name, email, password });
}

// Helper to attach enhanced submit behavior to a form
function enhanceAuthForm(formId, type){
  const form = document.getElementById(formId); if(!form) return;
  const msgEl = document.getElementById('msg');
  // read optional returnTo from query params
  function queryParam(name){ try{ const s = window.location.search.substring(1); const params = new URLSearchParams(s); return params.get(name); }catch(e){ return null; } }
  const returnTo = queryParam('returnTo') || 'index.html';
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    try{
      if(btn) { btn.disabled = true; btn.textContent = (type==='login') ? 'Logging in…' : 'Registering…'; }
      showMessage(msgEl, '');
        if(type === 'login'){
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const data = await loginRequest(email, password);
        saveAuth(data.token, data.user);
  // navigate back to returnTo (or index.html)
  window.location.href = returnTo;
      } else {
        const name = form.querySelector('#name') ? form.querySelector('#name').value : '';
        const email = form.querySelector('input[type="email"]').value;
        const password = form.querySelector('input[type="password"]').value;
        const data = await registerRequest(name, email, password);
  saveAuth(data.token, data.user);
  // navigate back to returnTo (or index.html)
  window.location.href = returnTo;
      }
    }catch(err){
      const msg = (err && err.info && (err.info.error || err.info.message)) ? (err.info.error||err.info.message) : (err.message || 'Request failed');
      showMessage(msgEl, msg || 'Error', true);
    }finally{
      if(btn){ btn.disabled = false; btn.textContent = (type==='login') ? 'Login' : 'Register'; }
    }
  });
}

// Expose a small API for pages
window.app = {
  postJSON, saveAuth, clearAuth, showMessage, loginRequest, registerRequest, enhanceAuthForm
};
