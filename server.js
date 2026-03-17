const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Password Protection Config ───
const SITE_PASSWORD = process.env.SITE_PASSWORD || '1234';
const AUTH_COOKIE = 'fc_auth';
const AUTH_TOKEN = crypto.createHash('sha256').update(SITE_PASSWORD).digest('hex').slice(0, 16);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Password Gate ───
// Serve the login page for unauthenticated users
app.post('/auth/login', (req, res) => {
  const { password } = req.body;
  if (password === SITE_PASSWORD) {
    res.cookie(AUTH_COOKIE, AUTH_TOKEN, {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax'
    });
    return res.json({ success: true });
  }
  return res.status(401).json({ success: false, message: 'Incorrect password' });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie(AUTH_COOKIE);
  res.json({ success: true });
});

// Password protection middleware
function requireAuth(req, res, next) {
  // Parse cookies manually (no cookie-parser dependency needed)
  const cookies = {};
  (req.headers.cookie || '').split(';').forEach(c => {
    const [key, val] = c.trim().split('=');
    if (key) cookies[key] = val;
  });

  if (cookies[AUTH_COOKIE] === AUTH_TOKEN) {
    return next();
  }

  // Show the password gate page
  res.send(getPasswordPage());
}

// Apply auth to all non-auth routes
app.use((req, res, next) => {
  if (req.path.startsWith('/auth/')) return next();
  requireAuth(req, res, next);
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

// Fallback: serve index.html for any non-API route (SPA support)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  } else {
    next();
  }
});

app.listen(PORT, () => {
  console.log(`\n  🛒 FreshCart Server running at:`);
  console.log(`     http://localhost:${PORT}`);
  console.log(`\n  🔒 Password: ${SITE_PASSWORD}`);
  console.log(`     Share this password with people you trust.\n`);
});

// ─── Beautiful Password Gate HTML ───
function getPasswordPage() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FreshCart — Enter Password</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f1923 0%, #1a2a3a 40%, #0d2818 100%);
      overflow: hidden;
      position: relative;
    }
    body::before {
      content: '';
      position: absolute;
      width: 600px; height: 600px;
      background: radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%);
      top: -200px; right: -100px;
      border-radius: 50%;
      animation: float 8s ease-in-out infinite;
    }
    body::after {
      content: '';
      position: absolute;
      width: 500px; height: 500px;
      background: radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%);
      bottom: -200px; left: -100px;
      border-radius: 50%;
      animation: float 10s ease-in-out infinite reverse;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-30px) scale(1.05); }
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.3); }
      50% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
    }
    .gate-card {
      position: relative;
      z-index: 10;
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 24px;
      padding: 48px 40px;
      width: 420px;
      max-width: 90vw;
      animation: fadeInUp 0.6s ease-out;
      box-shadow: 0 32px 64px rgba(0,0,0,0.4);
    }
    .gate-logo {
      text-align: center;
      margin-bottom: 8px;
      font-size: 48px;
      animation: pulse 2s ease-in-out infinite;
      width: 80px; height: 80px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 12px;
      background: rgba(34,197,94,0.1);
      border-radius: 20px;
    }
    .gate-title {
      text-align: center;
      font-size: 26px;
      font-weight: 700;
      color: #f0fdf4;
      margin-bottom: 4px;
    }
    .gate-title span { color: #22c55e; }
    .gate-subtitle {
      text-align: center;
      color: rgba(255,255,255,0.45);
      font-size: 14px;
      margin-bottom: 32px;
      font-weight: 400;
    }
    .gate-label {
      display: block;
      color: rgba(255,255,255,0.6);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .gate-input-wrap {
      position: relative;
      margin-bottom: 24px;
    }
    .gate-input-wrap svg {
      position: absolute;
      left: 16px; top: 50%; transform: translateY(-50%);
      width: 20px; height: 20px;
      color: rgba(255,255,255,0.3);
      transition: color 0.3s;
    }
    .gate-input {
      width: 100%;
      padding: 16px 16px 16px 48px;
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px;
      color: #f0fdf4;
      font-size: 16px;
      font-family: 'Inter', sans-serif;
      outline: none;
      transition: all 0.3s;
    }
    .gate-input:focus {
      border-color: rgba(34,197,94,0.5);
      background: rgba(255,255,255,0.08);
      box-shadow: 0 0 0 4px rgba(34,197,94,0.1);
    }
    .gate-input:focus + svg,
    .gate-input:focus ~ svg { color: #22c55e; }
    .gate-input::placeholder { color: rgba(255,255,255,0.25); }
    .gate-btn {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;
      overflow: hidden;
    }
    .gate-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(34,197,94,0.3);
    }
    .gate-btn:active { transform: translateY(0); }
    .gate-error {
      color: #f87171;
      font-size: 13px;
      text-align: center;
      margin-top: 16px;
      min-height: 20px;
      transition: opacity 0.3s;
    }
    .gate-error.visible { animation: shake 0.4s ease; }
    .gate-footer {
      text-align: center;
      margin-top: 24px;
      color: rgba(255,255,255,0.25);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="gate-card">
    <div class="gate-logo">🛒</div>
    <h1 class="gate-title">Fresh<span>Cart</span></h1>
    <p class="gate-subtitle">Enter the password to access this store</p>
    <form id="gate-form">
      <label class="gate-label" for="gate-password">Password</label>
      <div class="gate-input-wrap">
        <input class="gate-input" type="password" id="gate-password" placeholder="Enter access password…" autofocus required>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <button class="gate-btn" type="submit">Unlock Store</button>
      <div class="gate-error" id="gate-error"></div>
    </form>
    <div class="gate-footer">🔒 This store is password-protected</div>
  </div>
  <script>
    document.getElementById('gate-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw = document.getElementById('gate-password').value;
      const errEl = document.getElementById('gate-error');
      try {
        const res = await fetch('/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: pw })
        });
        const data = await res.json();
        if (data.success) {
          window.location.reload();
        } else {
          errEl.textContent = 'Incorrect password — try again';
          errEl.classList.add('visible');
          document.getElementById('gate-password').select();
          setTimeout(() => errEl.classList.remove('visible'), 600);
        }
      } catch (err) {
        errEl.textContent = 'Connection error — please try again';
        errEl.classList.add('visible');
      }
    });
  </script>
</body>
</html>`;
}
