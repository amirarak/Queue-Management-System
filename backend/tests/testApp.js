const express = require('express');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const Joi     = require('joi');

const JWT_SECRET = 'test-secret-key';
const JWT_EXPIRE = '1h';


const departments = [
  { id: 1, code: 'ENG', nameRu: 'Факультет инженерии и информатики', nameEn: 'Faculty of Engineering and Informatics', nameKy: 'Инженерия жана информатика факультети', isActive: true },
  { id: 2, code: 'ECO', nameRu: 'Факультет экономики и управления',  nameEn: 'Faculty of Economics and Management',    nameKy: 'Экономика жана башкаруу факультети',  isActive: true },
  { id: 3, code: 'SOC', nameRu: 'Факультет социальных наук',         nameEn: 'Faculty of Social Sciences',             nameKy: 'Социалдык илимдер факультети',        isActive: true },
  { id: 4, code: 'MED', nameRu: 'Медицинский факультет',             nameEn: 'Faculty of Medicine',                    nameKy: 'Медицина факультети',                 isActive: true },
  { id: 5, code: 'HUM', nameRu: 'Факультет гуманитарных наук',       nameEn: 'Faculty of Humanities',                  nameKy: 'Гуманитардык илимдер факультети',    isActive: true },
];

let users = [];
let tickets = [];
let ticketIdCounter = 1;
let userIdCounter   = 1;

async function seedUsers() {
  const adminHash = await bcrypt.hash('Admin123!', 12);
  const staffHash = await bcrypt.hash('Staff123!', 12);
  users = [
    { id: userIdCounter++, username: 'admin@alatoo.edu.kg', password: adminHash, fullName: 'System Administrator', role: 'admin',  departmentId: null, isActive: true, isVerified: true, verificationToken: null, lastLogin: null },
    { id: userIdCounter++, username: 'staff1@alatoo.edu.kg', password: staffHash, fullName: 'Staff Member One',   role: 'staff',  departmentId: 1,    isActive: true, isVerified: true, verificationToken: null, lastLogin: null },
    { id: userIdCounter++, username: 'inactive@alatoo.edu.kg', password: staffHash, fullName: 'Inactive Staff',  role: 'staff',  departmentId: 1,    isActive: false, isVerified: true, verificationToken: null, lastLogin: null },
    { id: userIdCounter++, username: 'unverified@alatoo.edu.kg', password: staffHash, fullName: 'Unverified',    role: 'staff',  departmentId: 1,    isActive: true,  isVerified: false, verificationToken: 'valid-invite-token-abc123', lastLogin: null },
    { id: userIdCounter++, username: 'staff2@alatoo.edu.kg', password: staffHash, fullName: 'Staff Member Two',  role: 'staff',  departmentId: 2,    isActive: true,  isVerified: true, verificationToken: null, lastLogin: null },
  ];
}

function resetTickets() {
  tickets = [];
  ticketIdCounter = 1;
}


function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, departmentId: user.departmentId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

function getDayBounds() {
  const now   = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  return { start, end };
}


function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  try {
    req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    try { req.user = jwt.verify(auth.split(' ')[1], JWT_SECRET); } catch {}
  }
  next();
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Authentication required' });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    next();
  };
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin access required' });
  next();
}


const registerSchema = Joi.object({
  username:     Joi.string().email().pattern(/@alatoo\.edu\.kg$/).required(),
  password:     Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  fullName:     Joi.string().min(2).max(255).required(),
  role:         Joi.string().valid('staff', 'admin').optional(),
  departmentId: Joi.number().integer().positive().allow(null).optional()
});

const loginSchema = Joi.object({
  username: Joi.string().email().required(),
  password: Joi.string().required()
});

const createTicketSchema = Joi.object({
  studentName:   Joi.string().max(255).optional(),
  purposeKey:    Joi.string().min(3).max(100).optional(),
  purpose:       Joi.string().min(3).max(255).optional(),
  departmentId:  Joi.number().integer().positive().required(),
  serviceTypeId: Joi.number().integer().positive().allow(null).optional()
}).or('purposeKey', 'purpose');

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }
    req.body = value;
    next();
  };
}


function buildApp() {
  const app = express();
  app.use(express.json());

  const auth = express.Router();

  auth.post('/login', validate(loginSchema), async (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username);
    if (!user) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Неверный email или пароль' });

    if (!user.isActive)   return res.status(403).json({ success: false, message: 'Аккаунт деактивирован.' });
    if (!user.isVerified) return res.status(403).json({ success: false, message: 'Сначала установите пароль по ссылке из письма.' });

    const token = signToken(user);
    user.lastLogin = new Date();
    res.json({ success: true, data: { token, user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role, departmentId: user.departmentId } } });
  });

  auth.post('/register', authenticate, adminOnly, validate(registerSchema), async (req, res) => {
    const { username, password, fullName, role, departmentId } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = { id: userIdCounter++, username, password: hash, fullName, role: role || 'staff', departmentId: departmentId || null, isActive: true, isVerified: false, verificationToken: 'new-invite-token', lastLogin: null };
    users.push(user);
    res.status(201).json({ success: true, message: `Сотрудник создан. Письмо отправлено на ${username}`, data: { id: user.id, username: user.username, fullName: user.fullName, role: user.role, departmentId: user.departmentId } });
  });

  auth.post('/set-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Токен и пароль обязательны' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Пароль должен быть минимум 8 символов' });

    const user = users.find(u => u.verificationToken === token);
    if (!user) return res.status(400).json({ success: false, message: 'Ссылка недействительна или уже использована' });

    user.password = await bcrypt.hash(password, 12);
    user.isVerified = true;
    user.verificationToken = null;
    res.json({ success: true, message: 'Пароль успешно установлен. Теперь вы можете войти.' });
  });

  auth.post('/forgot-password', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Email обязателен' });
    res.json({ success: true, message: `Если аккаунт существует, письмо отправлено на ${username}` });
  });

  auth.get('/me', authenticate, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password, verificationToken, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  });

  auth.post('/logout', authenticate, (req, res) => {
    res.json({ success: true, message: 'Logout successful' });
  });

  auth.put('/change-password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = users.find(u => u.id === req.user.id);
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(400).json({ success: false, message: 'Текущий пароль неверен' });
    user.password = await bcrypt.hash(newPassword, 12);
    res.json({ success: true, message: 'Пароль изменён' });
  });

  app.use('/api/auth', auth);

  const usersRouter = express.Router();

  usersRouter.get('/departments', (req, res) => {
    res.json({ success: true, data: departments.filter(d => d.isActive) });
  });

  usersRouter.get('/', authenticate, adminOnly, (req, res) => {
    const safe = users.map(({ password, verificationToken, ...u }) => u);
    res.json({ success: true, data: safe });
  });

  usersRouter.post('/', authenticate, adminOnly, validate(registerSchema), async (req, res) => {
    const { username, password, fullName, role, departmentId } = req.body;
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ success: false, message: 'Пользователь с таким email уже существует' });
    }
    const hash = await bcrypt.hash(password, 12);
    const user = { id: userIdCounter++, username, password: hash, fullName, role: role || 'staff', departmentId: departmentId || null, isActive: true, isVerified: false, verificationToken: 'invite-token-mgmt', lastLogin: null };
    users.push(user);
    res.status(201).json({ success: true, message: `Сотрудник создан. Письмо отправлено на ${username}`, data: { id: user.id, username: user.username, fullName: user.fullName, role: user.role, departmentId: user.departmentId } });
  });

  usersRouter.put('/:id', authenticate, adminOnly, async (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot modify your own account here' });
    const { fullName, role, isActive, departmentId } = req.body;
    if (fullName     !== undefined) user.fullName     = fullName;
    if (role         !== undefined) user.role         = role;
    if (isActive     !== undefined) user.isActive     = isActive;
    if (departmentId !== undefined) user.departmentId = departmentId || null;
    const { password, verificationToken, ...safeUser } = user;
    const dept = departments.find(d => d.id === user.departmentId) || null;
    res.json({ success: true, message: 'User updated', data: { ...safeUser, department: dept } });
  });

  usersRouter.delete('/:id', authenticate, adminOnly, (req, res) => {
    const idx = users.findIndex(u => u.id === parseInt(req.params.id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    if (users[idx].id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    users.splice(idx, 1);
    res.json({ success: true, message: 'User deleted' });
  });

  app.use('/api/users', usersRouter);

  const ticketsRouter = express.Router();

  ticketsRouter.post('/', optionalAuth, validate(createTicketSchema), (req, res) => {
    const { studentName, purposeKey, purpose, departmentId, serviceTypeId } = req.body;
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });

    const { start, end } = getDayBounds();
    const deptTickets = tickets.filter(t => t.departmentId === departmentId && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    const lastNum     = deptTickets.length > 0 ? Math.max(...deptTickets.map(t => t.ticketNumber)) : 0;
    const ticketNumber = lastNum + 1;
    const ticketCode   = `${dept.code}-${ticketNumber}`;

    const ticket = {
      id: ticketIdCounter++,
      ticketNumber,
      ticketCode,
      studentName: studentName || 'Студент',
      purposeKey: purposeKey || purpose,
      purpose: purposeKey || purpose,
      departmentId,
      serviceTypeId: serviceTypeId || null,
      status: 'waiting',
      servedBy: null,
      calledAt: null,
      completedAt: null,
      waitTime: null,
      serviceTime: null,
      notes: null,
      createdAt: new Date(),
      department: dept
    };
    tickets.push(ticket);
    res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
  });

  ticketsRouter.get('/', authenticate, authorize('staff', 'admin'), (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    const { start, end } = getDayBounds();
    let filtered = tickets.filter(t => new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    if (req.query.status) filtered = filtered.filter(t => t.status === req.query.status);
    if (user?.departmentId && req.user.role !== 'admin') filtered = filtered.filter(t => t.departmentId === user.departmentId);
    res.json({ success: true, data: filtered, pagination: { total: filtered.length, page: 1, limit: 20, pages: 1 } });
  });

  ticketsRouter.get('/:id', (req, res) => {
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  });

  ticketsRouter.delete('/:id', authenticate, authorize('staff', 'admin'), (req, res) => {
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'waiting') return res.status(400).json({ success: false, message: 'Only waiting tickets can be cancelled' });
    ticket.status = 'cancelled';
    res.json({ success: true, message: 'Ticket cancelled', data: ticket });
  });

  app.use('/api/tickets', ticketsRouter);

  const queueRouter = express.Router();

  queueRouter.get('/', optionalAuth, (req, res) => {
    const { start, end } = getDayBounds();
    let waiting = tickets.filter(t => t.status === 'waiting' && new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      waiting = waiting.filter(t => t.departmentId === req.user.departmentId);
    }
    res.json({ success: true, data: { tickets: waiting, count: waiting.length } });
  });

  queueRouter.get('/current', optionalAuth, (req, res) => {
    let serving = tickets.filter(t => t.status === 'serving');
    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      serving = serving.filter(t => t.departmentId === req.user.departmentId);
    }
    const ticket = serving.sort((a, b) => new Date(b.calledAt) - new Date(a.calledAt))[0] || null;
    res.json({ success: true, data: ticket });
  });

  queueRouter.get('/history', optionalAuth, (req, res) => {
    const limit = parseInt(req.query.limit) || 5;
    const { start, end } = getDayBounds();
    let called = tickets.filter(t =>
      ['serving', 'completed'].includes(t.status) &&
      t.calledAt &&
      new Date(t.createdAt) >= start &&
      new Date(t.createdAt) <= end
    );
    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      called = called.filter(t => t.departmentId === req.user.departmentId);
    }
    called.sort((a, b) => new Date(b.calledAt) - new Date(a.calledAt));
    res.json({ success: true, data: called.slice(0, limit) });
  });

  queueRouter.post('/call-next', authenticate, authorize('staff', 'admin'), (req, res) => {
    const servingWhere = { status: 'serving' };
    let alreadyServing = tickets.find(t => {
      if (t.status !== 'serving') return false;
      if (req.user.role !== 'admin' && req.user.departmentId) return t.departmentId === req.user.departmentId;
      return true;
    });
    if (alreadyServing) {
      return res.status(400).json({ success: false, message: 'Another ticket is currently being served. Complete it first.' });
    }

    const { start, end } = getDayBounds();
    let waiting = tickets.filter(t => {
      if (t.status !== 'waiting') return false;
      if (new Date(t.createdAt) < start || new Date(t.createdAt) > end) return false;
      if (req.user.role !== 'admin' && req.user.departmentId) return t.departmentId === req.user.departmentId;
      return true;
    }).sort((a, b) => a.ticketNumber - b.ticketNumber);

    if (waiting.length === 0) return res.status(404).json({ success: false, message: 'No waiting tickets in queue' });

    const next = waiting[0];
    next.status   = 'serving';
    next.calledAt = new Date();
    next.waitTime = Math.round((next.calledAt - new Date(next.createdAt)) / 1000);
    next.servedBy = req.user.id;

    res.json({ success: true, message: 'Ticket called successfully', data: next });
  });

  queueRouter.put('/:id/complete', authenticate, authorize('staff', 'admin'), (req, res) => {
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'serving') return res.status(400).json({ success: false, message: 'Only serving tickets can be completed' });
    ticket.status      = 'completed';
    ticket.completedAt = new Date();
    ticket.serviceTime = Math.round((ticket.completedAt - new Date(ticket.calledAt)) / 1000);
    ticket.notes       = req.body.notes || null;
    res.json({ success: true, message: 'Ticket completed successfully', data: ticket });
  });

  queueRouter.put('/:id/skip', authenticate, authorize('staff', 'admin'), (req, res) => {
    const ticket = tickets.find(t => t.id === parseInt(req.params.id));
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'serving') return res.status(400).json({ success: false, message: 'Only serving tickets can be skipped' });
    ticket.status      = 'cancelled';
    ticket.completedAt = new Date();
    ticket.serviceTime = Math.round((ticket.completedAt - new Date(ticket.calledAt)) / 1000);
    ticket.notes       = 'skipped';
    res.json({ success: true, message: 'Ticket skipped', data: ticket });
  });

  app.use('/api/queue', queueRouter);

  const analyticsRouter = express.Router();

  function computeStats(filtered) {
    const total     = filtered.length;
    const completed = filtered.filter(t => t.status === 'completed').length;
    const cancelled = filtered.filter(t => t.status === 'cancelled').length;
    const waiting   = filtered.filter(t => t.status === 'waiting').length;
    const serving   = filtered.filter(t => t.status === 'serving').length;

    const waitSamples = filtered.filter(t => t.calledAt && t.createdAt).map(t => (new Date(t.calledAt) - new Date(t.createdAt)) / 1000).filter(s => s >= 0);
    const avgWaitTime = waitSamples.length > 0 ? Math.round(waitSamples.reduce((a, b) => a + b, 0) / waitSamples.length) : 0;

    const serviceSamples = filtered.filter(t => t.completedAt && t.calledAt && t.status === 'completed').map(t => (new Date(t.completedAt) - new Date(t.calledAt)) / 1000).filter(s => s > 0);
    const avgServiceTime = serviceSamples.length > 0 ? Math.round(serviceSamples.reduce((a, b) => a + b, 0) / serviceSamples.length) : 0;

    const serviceCounts = {};
    filtered.forEach(t => { const k = t.purposeKey || t.purpose || 'other'; serviceCounts[k] = (serviceCounts[k] || 0) + 1; });
    const topServices = Object.entries(serviceCounts).map(([purpose, count]) => ({ purpose, count })).sort((a, b) => b.count - a.count).slice(0, 6);

    const staffMap = {};
    filtered.filter(t => t.status === 'completed' && t.servedBy).forEach(t => {
      if (!staffMap[t.servedBy]) { const u = users.find(u => u.id === t.servedBy); staffMap[t.servedBy] = { id: t.servedBy, fullName: u?.fullName || 'Unknown', served: 0 }; }
      staffMap[t.servedBy].served++;
    });

    return {
      overview: { total, completed, waiting, serving, cancelled, completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0 },
      timing: { avgWaitTime, avgServiceTime },
      topServices,
      staffStats: Object.values(staffMap).sort((a, b) => b.served - a.served)
    };
  }

  analyticsRouter.get('/today', authenticate, authorize('staff', 'admin'), (req, res) => {
    const { start, end } = getDayBounds();
    const filtered = tickets.filter(t => new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    res.json({ success: true, data: computeStats(filtered) });
  });

  analyticsRouter.get('/period', authenticate, authorize('staff', 'admin'), (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: 'startDate and endDate required' });
    const start = new Date(`${startDate}T00:00:00.000`);
    const end   = new Date(`${endDate}T23:59:59.999`);
    const filtered = tickets.filter(t => new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    res.json({ success: true, data: computeStats(filtered) });
  });

  analyticsRouter.get('/export', authenticate, authorize('admin'), (req, res) => {
    const { startDate, endDate } = req.query;
    const { start, end } = startDate && endDate
      ? { start: new Date(`${startDate}T00:00:00.000`), end: new Date(`${endDate}T23:59:59.999`) }
      : getDayBounds();
    const filtered = tickets.filter(t => new Date(t.createdAt) >= start && new Date(t.createdAt) <= end);
    res.json({
      success: true,
      data: filtered.map(t => ({
        ticketCode:  t.ticketCode || t.ticketNumber,
        studentName: t.studentName,
        purposeKey:  t.purposeKey || t.purpose,
        status:      t.status,
        createdAt:   t.createdAt,
        calledAt:    t.calledAt,
        completedAt: t.completedAt,
        servedBy:    users.find(u => u.id === t.servedBy)?.fullName || null
      })),
      meta: { exportedAt: new Date().toISOString(), count: filtered.length }
    });
  });

  app.use('/api/analytics', analyticsRouter);

  app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }));

  app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

  return app;
}

module.exports = { buildApp, seedUsers, resetTickets, users, departments, signToken, JWT_SECRET };
module.exports.getUsers = () => users;