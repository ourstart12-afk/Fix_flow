import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const scrypt = promisify(scryptCallback);
const PORT = Number(process.env.PORT || 4000);
const HOST = process.env.HOST || '127.0.0.1';
const SESSION_COOKIE = 'fixflow_session';
const SESSION_LENGTH = 7 * 24 * 60 * 60 * 1000;
const USERS_FILE = process.env.FIXFLOW_USERS_FILE
  ? resolve(process.env.FIXFLOW_USERS_FILE)
  : join(dirname(fileURLToPath(import.meta.url)), 'data', 'users.json');
const REQUESTS_FILE = process.env.FIXFLOW_REQUESTS_FILE
  ? resolve(process.env.FIXFLOW_REQUESTS_FILE)
  : join(dirname(fileURLToPath(import.meta.url)), 'data', 'requests.json');
const DEVICES_FILE = process.env.FIXFLOW_DEVICES_FILE
  ? resolve(process.env.FIXFLOW_DEVICES_FILE)
  : join(dirname(fileURLToPath(import.meta.url)), 'data', 'devices.json');
const SESSION_SECURE = process.env.NODE_ENV === 'production';
const defaultOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const allowedOrigins = new Set(
  (process.env.FIXFLOW_ALLOWED_ORIGINS || defaultOrigins.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
);

const sessions = new Map();
const app = express();
let users = await readUsers();
let requests = await readRequests();
let devices = await readDevices();
const dummyPasswordHash = await hashPassword(randomBytes(24).toString('hex'));
await addConfiguredManager();

function sendJson(response, status, data, extraHeaders = {}) {
  response.status(status).set({ 'Cache-Control': 'no-store', ...extraHeaders }).json(data);
}

function addCorsHeaders(request, response) {
  const origin = request.headers.origin;
  const localDevelopmentOrigin = process.env.NODE_ENV !== 'production'
    && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin || '');
  response.setHeader('Vary', 'Origin');
  if (origin && (allowedOrigins.has(origin) || localDevelopmentOrigin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

async function readJson(request) {
  const body = request.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    const error = new Error('Please send a JSON object.');
    error.status = 400;
    throw error;
  }
  return body;
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validEmail(email) {
  return email.length <= 254 && /^\S+@\S+\.\S+$/.test(email);
}

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '+92 300 1234567',
    address: user.address || 'Sector F-8, Blue Area, Islamabad',
    contactPreference: user.contactPreference || 'email',
    createdAt: user.createdAt || '2026-01-15T10:00:00.000Z',
  };
}

function cookieValue(request, cookieName) {
  const cookieHeader = request.headers.cookie || '';
  const cookie = cookieHeader.split(';').map((item) => item.trim())
    .find((item) => item.startsWith(`${cookieName}=`));
  return cookie ? cookie.slice(cookieName.length + 1) : '';
}

function sessionCookie(value, maxAge) {
  const secure = SESSION_SECURE ? '; Secure' : '';
  return `${SESSION_COOKIE}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure}`;
}

function createSession(user) {
  const id = randomBytes(32).toString('base64url');
  sessions.set(id, { userId: user.id, expiresAt: Date.now() + SESSION_LENGTH });
  return id;
}

function sessionUser(request) {
  const id = cookieValue(request, SESSION_COOKIE);
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(id);
    return null;
  }
  return users.find((user) => user.id === session.userId) || null;
}

function requireAccountFields({ name, email, password }, includeName = false) {
  const normalizedEmail = normalizeEmail(email);
  if (!validEmail(normalizedEmail)) {
    const error = new Error('Enter a valid email address.');
    error.status = 400;
    throw error;
  }
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    const error = new Error('Password must be between 8 and 128 characters.');
    error.status = 400;
    throw error;
  }
  if (includeName && (typeof name !== 'string' || !name.trim() || name.trim().length > 100)) {
    const error = new Error('Enter a name of up to 100 characters.');
    error.status = 400;
    throw error;
  }
  return normalizedEmail;
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, 64);
  return `${salt}:${hash.toString('hex')}`;
}

async function passwordMatches(password, savedHash) {
  const [salt, savedKey] = (savedHash || '').split(':');
  if (!salt || !savedKey) return false;
  const savedBuffer = Buffer.from(savedKey, 'hex');
  const submittedBuffer = await scrypt(password, salt, 64);
  return savedBuffer.length === submittedBuffer.length
    && timingSafeEqual(savedBuffer, submittedBuffer);
}

async function readUsers() {
  try {
    const contents = await readFile(USERS_FILE, 'utf8');
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveUsers() {
  await mkdir(dirname(USERS_FILE), { recursive: true });
  await writeFile(USERS_FILE, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
}

async function readRequests() {
  try {
    const contents = await readFile(REQUESTS_FILE, 'utf8');
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveRequests() {
  try {
    await mkdir(dirname(REQUESTS_FILE), { recursive: true });
    await writeFile(REQUESTS_FILE, `${JSON.stringify(requests, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.error('Could not save requests to disk:', err.message);
  }
}

async function readDevices() {
  try {
    const contents = await readFile(DEVICES_FILE, 'utf8');
    const parsed = JSON.parse(contents);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function saveDevices() {
  try {
    await mkdir(dirname(DEVICES_FILE), { recursive: true });
    await writeFile(DEVICES_FILE, `${JSON.stringify(devices, null, 2)}\n`, 'utf8');
  } catch (err) {
    console.error('Could not save devices to disk:', err.message);
  }
}

async function addConfiguredManager() {
  const email = normalizeEmail(process.env.FIXFLOW_MANAGER_EMAIL);
  const password = process.env.FIXFLOW_MANAGER_PASSWORD;
  if (!email && !password) return;
  if (!email || !password) {
    throw new Error('Set both FIXFLOW_MANAGER_EMAIL and FIXFLOW_MANAGER_PASSWORD to enable the manager account.');
  }
  if (!validEmail(email) || password.length < 8 || password.length > 128) {
    throw new Error('The configured manager account needs a valid email and a password of 8 to 128 characters.');
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser && existingUser.role !== 'manager') {
    throw new Error('The configured manager email already belongs to a customer account. Choose another email.');
  }
  if (existingUser && (await passwordMatches(password, existingUser.passwordHash))) {
    return;
  }
  const manager = {
    id: existingUser?.id || randomUUID(),
    name: process.env.FIXFLOW_MANAGER_NAME?.trim() || 'Facility Manager',
    email,
    passwordHash: await hashPassword(password),
    role: 'manager',
  };
  if (existingUser) users = users.map((user) => user.id === existingUser.id ? manager : user);
  else users.push(manager);
  await saveUsers();
}

async function handleRequest(request, response) {
  const path = request.path;

  if (request.method === 'GET' && path === '/api/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'FixFlow API',
      capabilities: { passwordReset: true },
    });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/register') {
    const body = await readJson(request);
    const email = requireAccountFields(body, true);
    if (users.some((user) => user.email === email)) {
      sendJson(response, 409, { message: 'An account with this email already exists.' });
      return;
    }
    const user = {
      id: randomUUID(),
      name: body.name.trim(),
      email,
      passwordHash: await hashPassword(body.password),
      role: 'customer',
    };
    users.push(user);
    await saveUsers();
    const sessionId = createSession(user);
    sendJson(response, 201, { user: publicUser(user) }, {
      'Set-Cookie': sessionCookie(sessionId, Math.floor(SESSION_LENGTH / 1000)),
    });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/password-reset') {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    if (!validEmail(email)) {
      sendJson(response, 400, { message: 'Enter a valid email address.' });
      return;
    }
    if (process.env.NODE_ENV === 'production' || !['127.0.0.1', 'localhost'].includes(HOST)) {
      sendJson(response, 503, { message: 'Password reset is available only in local development.' });
      return;
    }
    if (typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) {
      sendJson(response, 400, { message: 'Password must be between 8 and 128 characters.' });
      return;
    }
    const user = users.find((account) => account.email === email);
    if (!user) {
      sendJson(response, 404, { message: 'No account found for this email.' });
      return;
    }
    user.passwordHash = await hashPassword(body.password);
    await saveUsers();
    for (const [sessionId, session] of sessions) {
      if (session.userId === user.id) sessions.delete(sessionId);
    }
    sendJson(response, 200, { message: 'Password reset. Sign in with your new password.' });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/login') {
    const body = await readJson(request);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';
    const user = users.find((account) => account.email === email);
    const passwordIsTooLong = password.length > 128;
    const passwordToCheck = passwordIsTooLong ? 'invalid-password' : password;
    const matches = await passwordMatches(passwordToCheck, user?.passwordHash || dummyPasswordHash);
    if (!user || passwordIsTooLong || !matches) {
      sendJson(response, 401, { message: 'We could not sign you in. Check your email and password and try again.' });
      return;
    }
    const sessionId = createSession(user);
    sendJson(response, 200, { user: publicUser(user) }, {
      'Set-Cookie': sessionCookie(sessionId, Math.floor(SESSION_LENGTH / 1000)),
    });
    return;
  }

  if (request.method === 'GET' && (path === '/api/auth/me' || path === '/api/auth/session')) {
    const user = sessionUser(request);
    if (!user) {
      sendJson(response, 401, { message: 'Please log in to continue.' });
      return;
    }
    sendJson(response, 200, { user: publicUser(user) });
    return;
  }

  if (request.method === 'GET' && (path === '/api/requests' || path === '/api/repairs')) {
    const urlObj = new URL(request.originalUrl, `http://${request.headers.host || 'localhost'}`);
    const customerId = urlObj.searchParams.get('customerId') || urlObj.searchParams.get('userId');
    const deviceId = urlObj.searchParams.get('deviceId');
    const status = urlObj.searchParams.get('status');
    const search = urlObj.searchParams.get('search');

    let filtered = [...requests];
    if (customerId) {
      filtered = filtered.filter((r) => r.userId === customerId || r.customerId === customerId);
    }
    if (deviceId) {
      filtered = filtered.filter((r) => r.deviceId === deviceId);
    }
    if (status && status !== 'All' && status !== 'All statuses') {
      filtered = filtered.filter((r) => r.status?.toLowerCase() === status.toLowerCase());
    }
    if (search) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((r) =>
        r.id?.toLowerCase().includes(q) ||
        r.deviceModel?.toLowerCase().includes(q) ||
        r.brand?.toLowerCase().includes(q) ||
        r.model?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q) ||
        r.issueDescription?.toLowerCase().includes(q)
      );
    }
    sendJson(response, 200, { requests: filtered, repairs: filtered, data: filtered });
    return;
  }

  if (request.method === 'POST' && path === '/api/requests') {
    const body = await readJson(request);
    const user = sessionUser(request);
    const deviceType = body.deviceType || body.type;
    const brand = body.brand;
    const model = body.model || body.deviceModel;
    const problemCategory = body.problemCategory || body.category || body.issueCategory;
    const problemDescription = body.problemDescription || body.description || body.issueDescription;

    if (!deviceType || (!model && !brand) || !problemDescription) {
      sendJson(response, 400, { message: 'Missing required repair fields. Device type, model/brand, and description are required.' });
      return;
    }

    const nextNum = 1000 + requests.length + 1;
    const newId = `REQ-${nextNum}`;
    const newReq = {
      id: newId,
      userId: user?.id || body.customerId || body.userId || '37ee5d30-4b85-4859-9794-f42f3f76722a',
      customerId: user?.id || body.customerId || 'C-101',
      customerName: user?.name || body.customerName || body.contact || 'Valued Customer',
      customerEmail: user?.email || body.customerEmail || '',
      customerPhone: user?.phone || body.customerPhone || body.contact || '',
      deviceId: body.deviceId || null,
      deviceType: deviceType.trim(),
      deviceModel: model ? (brand ? `${brand.trim()} ${model.trim()}` : model.trim()) : brand.trim(),
      brand: brand?.trim() || '',
      model: model?.trim() || '',
      deviceSerial: (body.deviceSerial || body.serial || '').trim(),
      issueCategory: (problemCategory || 'General Issue').trim(),
      issueDescription: problemDescription.trim(),
      contact: (body.contact || user?.phone || user?.email || '').trim(),
      status: 'Submitted',
      priority: body.priority || 'normal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: [
        {
          id: `N-${Date.now()}`,
          author: 'FixFlow Intake',
          role: 'System',
          date: new Date().toISOString(),
          text: 'Repair request created and submitted successfully.'
        }
      ]
    };

    requests.unshift(newReq);
    await saveRequests();
    sendJson(response, 201, { request: newReq, data: newReq, id: newReq.id });
    return;
  }

  if (request.method === 'GET' && path.startsWith('/api/requests/')) {
    let id = path.slice('/api/requests/'.length).trim();
    if (id.endsWith('/status')) {
      id = id.slice(0, -'/status'.length).trim();
    }
    const reqItem = requests.find((r) => r.id.toLowerCase() === id.toLowerCase());
    if (!reqItem) {
      sendJson(response, 404, { message: 'Service ticket not found.' });
      return;
    }
    sendJson(response, 200, { request: reqItem, data: reqItem });
    return;
  }

  if (request.method === 'PATCH' && path.startsWith('/api/requests/')) {
    let id = path.slice('/api/requests/'.length).trim();
    if (id.endsWith('/status')) {
      id = id.slice(0, -'/status'.length).trim();
    }
    const reqIndex = requests.findIndex((r) => r.id.toLowerCase() === id.toLowerCase());
    if (reqIndex === -1) {
      sendJson(response, 404, { message: 'Service ticket not found.' });
      return;
    }
    const body = await readJson(request);
    const existing = requests[reqIndex];
    if (body.status) existing.status = body.status;
    if (body.priority) existing.priority = body.priority;
    if (body.assignedTechnician) existing.assignedTechnician = body.assignedTechnician;
    if (body.estimatedCompletion) existing.estimatedCompletion = body.estimatedCompletion;
    if (body.newNote && typeof body.newNote.text === 'string' && body.newNote.text.trim()) {
      if (!Array.isArray(existing.notes)) existing.notes = [];
      existing.notes.push({
        id: `N-${Date.now()}`,
        author: body.newNote.author || 'Facility Manager',
        role: body.newNote.role || 'Management Staff',
        date: new Date().toISOString(),
        text: body.newNote.text.trim(),
      });
    }
    existing.updatedAt = new Date().toISOString();
    requests[reqIndex] = existing;
    await saveRequests();
    sendJson(response, 200, { request: existing, data: existing, message: 'Ticket updated successfully.' });
    return;
  }

  if (request.method === 'GET' && path === '/api/devices') {
    const urlObj = new URL(request.originalUrl, `http://${request.headers.host || 'localhost'}`);
    const user = sessionUser(request);
    const userId = urlObj.searchParams.get('userId');

    let userDevices = [...devices];
    if (userId) {
      userDevices = userDevices.filter((d) => d.userId === userId);
    } else if (user && user.role === 'customer') {
      const owned = userDevices.filter((d) => d.userId === user.id);
      // If customer has devices, return theirs; if not yet seeded for this new user, show empty or all
      userDevices = owned;
    }
    sendJson(response, 200, { devices: userDevices, data: userDevices });
    return;
  }

  if (request.method === 'GET' && path.startsWith('/api/devices/')) {
    const id = path.slice('/api/devices/'.length).trim();
    const found = devices.find((d) => d.id.toLowerCase() === id.toLowerCase());
    if (!found) {
      sendJson(response, 404, { message: 'Device not found.' });
      return;
    }
    sendJson(response, 200, { device: found, data: found });
    return;
  }

  if (request.method === 'POST' && path === '/api/devices') {
    const body = await readJson(request);
    const user = sessionUser(request);
    if (!body.type?.trim() || !body.brand?.trim() || !body.model?.trim()) {
      sendJson(response, 400, { message: 'Device type, brand and model are required.' });
      return;
    }
    const newDevice = {
      id: `DEV-${Math.floor(2000 + devices.length + 1)}`,
      userId: user?.id || body.userId || '37ee5d30-4b85-4859-9794-f42f3f76722a',
      type: body.type.trim(),
      brand: body.brand.trim(),
      model: body.model.trim(),
      serial: (body.serial || '').trim(),
      nickname: (body.nickname || '').trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    devices.unshift(newDevice);
    await saveDevices();
    sendJson(response, 201, { device: newDevice, data: newDevice, id: newDevice.id });
    return;
  }

  if (request.method === 'PUT' && path.startsWith('/api/devices/')) {
    const id = path.slice('/api/devices/'.length).trim();
    const devIndex = devices.findIndex((d) => d.id.toLowerCase() === id.toLowerCase());
    if (devIndex === -1) {
      sendJson(response, 404, { message: 'Device not found.' });
      return;
    }
    const body = await readJson(request);
    if (!body.brand?.trim() || !body.model?.trim()) {
      sendJson(response, 400, { message: 'Brand and model are required.' });
      return;
    }
    const existing = devices[devIndex];
    if (body.type) existing.type = body.type.trim();
    if (body.brand) existing.brand = body.brand.trim();
    if (body.model) existing.model = body.model.trim();
    if (body.serial !== undefined) existing.serial = body.serial.trim();
    if (body.nickname !== undefined) existing.nickname = body.nickname.trim();
    existing.updatedAt = new Date().toISOString();
    devices[devIndex] = existing;
    await saveDevices();
    sendJson(response, 200, { device: existing, data: existing, message: 'Device updated successfully.' });
    return;
  }

  if (request.method === 'PATCH' && (path === '/api/auth/profile' || path === '/api/auth/me')) {
    const user = sessionUser(request);
    if (!user) {
      sendJson(response, 401, { message: 'Please log in to continue.' });
      return;
    }
    const body = await readJson(request);
    if (typeof body.name === 'string' && body.name.trim()) user.name = body.name.trim();
    if (typeof body.phone === 'string') user.phone = body.phone.trim();
    if (typeof body.address === 'string') user.address = body.address.trim();
    if (typeof body.contactPreference === 'string') user.contactPreference = body.contactPreference;
    if (typeof body.email === 'string' && validEmail(normalizeEmail(body.email))) {
      const nextEmail = normalizeEmail(body.email);
      const isTaken = users.some((u) => u.email === nextEmail && u.id !== user.id);
      if (!isTaken) user.email = nextEmail;
    }
    await saveUsers();
    sendJson(response, 200, { user: publicUser(user), message: 'Profile updated successfully.' });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/change-password') {
    const user = sessionUser(request);
    if (!user) {
      sendJson(response, 401, { message: 'Please log in to continue.' });
      return;
    }
    const body = await readJson(request);
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      sendJson(response, 400, { message: 'Both current password and new password are required.' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) {
      sendJson(response, 400, { message: 'New password must be between 8 and 128 characters.' });
      return;
    }
    const matches = await passwordMatches(currentPassword, user.passwordHash);
    if (!matches) {
      sendJson(response, 400, { message: 'Current password does not match.' });
      return;
    }
    user.passwordHash = await hashPassword(newPassword);
    await saveUsers();
    sendJson(response, 200, { message: 'Password changed successfully.' });
    return;
  }

  if (request.method === 'POST' && path === '/api/auth/logout') {
    const sessionId = cookieValue(request, SESSION_COOKIE);
    if (sessionId) sessions.delete(sessionId);
    sendJson(response, 200, { message: 'You have been signed out.' }, {
      'Set-Cookie': sessionCookie('', 0),
    });
    return;
  }

  sendJson(response, 404, { message: 'This API route does not exist.' });
}

app.use((request, response, next) => {
  addCorsHeaders(request, response);
  if (request.method === 'OPTIONS') return response.status(204).end();
  next();
});
app.use(express.json({ limit: 16_000, strict: true }));

const apiRoutes = {
  get: [
    '/api/health', '/api/auth/me', '/api/auth/session',
    '/api/requests', '/api/requests/:id', '/api/requests/:id/status',
    '/api/repairs', '/api/devices', '/api/devices/:id',
  ],
  post: [
    '/api/auth/register', '/api/auth/password-reset', '/api/auth/login',
    '/api/requests', '/api/devices', '/api/auth/change-password', '/api/auth/logout',
  ],
  put: ['/api/devices/:id'],
  patch: [
    '/api/requests/:id', '/api/requests/:id/status',
    '/api/auth/profile', '/api/auth/me',
  ],
};

for (const [method, paths] of Object.entries(apiRoutes)) {
  for (const path of paths) app[method](path, handleRequest);
}

app.use((request, response) => {
  sendJson(response, 404, { message: 'This API route does not exist.' });
});

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error);
  const status = error.status || error.statusCode || 500;
  const message = status === 500
    ? 'The server could not complete this request.'
    : error.type === 'entity.too.large'
      ? 'Request is too large.'
      : error instanceof SyntaxError
        ? 'Please send valid JSON.'
        : error.message;
  sendJson(response, status, { message });
  if (status === 500) console.error(error);
});

app.listen(PORT, HOST, () => {
  const activeManagerEmail = normalizeEmail(process.env.FIXFLOW_MANAGER_EMAIL);
  console.log(`FixFlow API is running at http://${HOST}:${PORT}`);
  console.log(`Health check: http://${HOST}:${PORT}/api/health`);
  console.log(process.env.FIXFLOW_MANAGER_EMAIL
    ? `Manager account enabled for ${activeManagerEmail}`
    : 'No manager account configured. Set FIXFLOW_MANAGER_EMAIL and FIXFLOW_MANAGER_PASSWORD to add one.');
});
