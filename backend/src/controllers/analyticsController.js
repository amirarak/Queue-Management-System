const { Ticket, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

const TZ_OFFSET_MS = 6 * 60 * 60 * 1000;

function getDayBoundsLocal(date = new Date()) {
  const localDate = new Date(date.getTime() + TZ_OFFSET_MS);
  const dayStr = localDate.toISOString().split('T')[0];
  const start = new Date(`${dayStr}T00:00:00.000+06:00`);
  const end   = new Date(`${dayStr}T23:59:59.999+06:00`);
  return { start, end };
}

function formatSeconds(secs) {
  if (!secs || secs <= 0) return null;
  return Math.round(secs);
}

const MAX_SERVICE_SECS = 120 * 60;
const MAX_WAIT_SECS    = 240 * 60;

async function getStats(where) {
  const tickets = await Ticket.findAll({
    where,
    include: [{ model: User, as: 'server', attributes: ['id','fullName'], required: false }],
    order: [['createdAt', 'DESC']],
    raw: false
  });

  const total     = tickets.length;
  const completed = tickets.filter(t => t.status === 'completed').length;
  const waiting   = tickets.filter(t => t.status === 'waiting').length;
  const serving   = tickets.filter(t => t.status === 'serving').length;
  const cancelled = tickets.filter(t => t.status === 'cancelled').length;

  const waitSamples = tickets
    .filter(t => t.calledAt && t.createdAt)
    .map(t => (new Date(t.calledAt) - new Date(t.createdAt)) / 1000)
    .filter(s => s >= 0 && s <= MAX_WAIT_SECS);

  const avgWaitSec = waitSamples.length > 0
    ? waitSamples.reduce((a, b) => a + b, 0) / waitSamples.length : 0;

  const serviceSamples = tickets
    .filter(t => t.completedAt && t.calledAt && t.status === 'completed')
    .map(t => (new Date(t.completedAt) - new Date(t.calledAt)) / 1000)
    .filter(s => s > 0 && s <= MAX_SERVICE_SECS);

  const avgServiceSec = serviceSamples.length > 0
    ? serviceSamples.reduce((a, b) => a + b, 0) / serviceSamples.length : 0;

  const hourCounts = {};
  tickets.forEach(t => {
    const localHour = new Date(new Date(t.createdAt).getTime() + TZ_OFFSET_MS).getUTCHours();
    hourCounts[localHour] = (hourCounts[localHour] || 0) + 1;
  });
  const hourlyDistribution = Object.entries(hourCounts)
    .map(([hour, count]) => ({ hour: parseInt(hour), count }))
    .sort((a, b) => a.hour - b.hour);

  const peakHour = hourlyDistribution.length > 0
    ? hourlyDistribution.reduce((p, c) => c.count > p.count ? c : p)
    : null;

  const serviceCounts = {};
  tickets.forEach(t => {
    const key = t.purposeKey || t.purpose || 'other';
    serviceCounts[key] = (serviceCounts[key] || 0) + 1;
  });
  const topServices = Object.entries(serviceCounts)
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const staffMap = {};
  tickets
    .filter(t => t.status === 'completed' && t.server)
    .forEach(t => {
      const id = t.server.id;
      if (!staffMap[id]) {
        staffMap[id] = { id, fullName: t.server.fullName, served: 0, totalSec: 0, samples: 0 };
      }
      staffMap[id].served += 1;
      if (t.completedAt && t.calledAt) {
        const s = (new Date(t.completedAt) - new Date(t.calledAt)) / 1000;
        if (s > 0 && s <= MAX_SERVICE_SECS) {
          staffMap[id].totalSec += s;
          staffMap[id].samples += 1;
        }
      }
    });

  const staffStats = Object.values(staffMap)
    .map(s => ({
      id: s.id,
      fullName: s.fullName,
      served: s.served,
      avgServiceTimeSec: s.samples > 0 ? Math.round(s.totalSec / s.samples) : null
    }))
    .sort((a, b) => b.served - a.served);

  return {
    overview: {
      total, completed, waiting, serving, cancelled,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(2) : 0
    },
    timing: {
      avgWaitTime:    Math.round(avgWaitSec),
      avgServiceTime: Math.round(avgServiceSec)
    },
    hourlyDistribution,
    peakHour,
    topServices,
    staffStats
  };
}

exports.getTodayStats = async (req, res, next) => {
  try {
    const { start, end } = getDayBoundsLocal();
    const data = await getStats({ createdAt: { [Op.between]: [start, end] } });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getPeriodStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, message: 'startDate and endDate required' });
    }
    const start = new Date(`${startDate}T00:00:00.000+06:00`);
    const end   = new Date(`${endDate}T23:59:59.999+06:00`);
    const data  = await getStats({ createdAt: { [Op.between]: [start, end] } });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.exportReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(`${startDate}T00:00:00.000+06:00`) : getDayBoundsLocal().start;
    const end   = endDate   ? new Date(`${endDate}T23:59:59.999+06:00`)   : getDayBoundsLocal().end;

    const tickets = await Ticket.findAll({
      where: { createdAt: { [Op.between]: [start, end] } },
      include: [{ model: User, as: 'server', attributes: ['fullName'], required: false }],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: tickets.map(t => ({
        ticketCode:   t.ticketCode || t.ticketNumber,
        studentName:  t.studentName,
        purposeKey:   t.purposeKey || t.purpose,
        status:       t.status,
        createdAt:    t.createdAt,
        calledAt:     t.calledAt,
        completedAt:  t.completedAt,
        servedBy:     t.server?.fullName || null
      })),
      meta: { exportedAt: new Date().toISOString(), count: tickets.length }
    });
  } catch (e) { next(e); }
};

exports.saveDailyAnalytics = async (req, res) => {
  res.json({ success: true, message: 'Analytics computed on the fly' });
};