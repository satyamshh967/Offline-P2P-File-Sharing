/**
 * Automated Test for Drive P2P Auth System
 */

const http = require('http');

function postJson(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = JSON.stringify(payload);

    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        ...headers
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function getJson(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request({
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname,
      method: 'GET',
      headers: { ...headers }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function runAuthTests() {
  console.log('========================================================');
  console.log('    Running Drive P2P Authentication Unit Tests');
  console.log('========================================================\n');

  const BASE_URL = 'http://127.0.0.1:3001/api/auth';

  // 1. Test Login with Demo User
  console.log('[Test 1] Logging in with default demo user...');
  const loginRes = await postJson(`${BASE_URL}/login`, {
    usernameOrEmail: 'satyam',
    password: 'drive123'
  });
  console.log('  -> Status:', loginRes.status);
  console.log('  -> User:', loginRes.body.user);
  if (loginRes.status !== 200 || !loginRes.body.token) {
    throw new Error('Default user login failed');
  }
  const token = loginRes.body.token;

  // 2. Test /me with Token
  console.log('\n[Test 2] Testing /me with session token...');
  const meRes = await getJson(`${BASE_URL}/me`, {
    'Authorization': `Bearer ${token}`
  });
  console.log('  -> Status:', meRes.status);
  console.log('  -> Me response:', meRes.body.user);
  if (meRes.status !== 200 || meRes.body.user.username !== 'satyam') {
    throw new Error('Token verification failed');
  }

  // 3. Test Invalid Password
  console.log('\n[Test 3] Testing login with invalid password...');
  const wrongLogin = await postJson(`${BASE_URL}/login`, {
    usernameOrEmail: 'satyam',
    password: 'wrongpassword'
  });
  console.log('  -> Status:', wrongLogin.status, '(expected 401)');
  if (wrongLogin.status !== 401) {
    throw new Error('Failed to reject wrong password');
  }

  // 4. Test Registration with New User
  console.log('\n[Test 4] Testing registration of new user...');
  const newUsername = `user_${Date.now().toString().substring(8)}`;
  const regRes = await postJson(`${BASE_URL}/register`, {
    username: newUsername,
    name: 'Test Student',
    email: `${newUsername}@school.edu`,
    password: 'securePassword123',
    avatarColor: '#10b981'
  });
  console.log('  -> Status:', regRes.status);
  console.log('  -> Registered User:', regRes.body.user);
  if (regRes.status !== 201 || !regRes.body.token) {
    throw new Error('Registration failed');
  }

  console.log('\n========================================================');
  console.log('     [PASS] All Authentication Tests Succeeded!');
  console.log('========================================================\n');
}

runAuthTests().catch(err => {
  console.error('\n[FAIL] Test Error:', err.message);
  process.exit(1);
});
