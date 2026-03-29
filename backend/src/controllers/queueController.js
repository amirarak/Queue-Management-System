const { Ticket, User, Department } = require('../models');
const { redisHelper } = require('../config/redis');
const { broadcastEvent } = require('../services/websocketService');
const logger = require('../utils/logger');
const { Op } = require('sequelize');
const { getDayBounds, getSecondsDiff } = require('../utils/helpers');

exports.getQueue = async (req, res, next) => {
  try {
    const { start, end } = getDayBounds();
    const where = {
      status: 'waiting',
      createdAt: { [Op.between]: [start, end] }
    };

    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: Department, as: 'department', attributes: ['id','code','nameRu','nameEn','nameKy'], required: false }
      ],
      order: [['ticketNumber', 'ASC']]
    });

    res.json({ success: true, data: { tickets, count: tickets.length } });
  } catch (error) { next(error); }
};

exports.getCurrentTicket = async (req, res, next) => {
  try {
    const where = { status: 'serving' };

    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const ticket = await Ticket.findOne({
      where,
      include: [
        { model: User, as: 'server', attributes: ['id', 'fullName'], required: false }
      ],
      order: [['calledAt', 'DESC']]
    });

    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

exports.callNextTicket = async (req, res, next) => {
  try {
    const servingWhere = { status: 'serving' };
    if (req.user.role !== 'admin' && req.user.departmentId) {
      servingWhere.departmentId = req.user.departmentId;
    }

    const servingTicket = await Ticket.findOne({ where: servingWhere });
    if (servingTicket) {
      return res.status(400).json({
        success: false,
        message: 'Another ticket is currently being served. Complete it first.'
      });
    }

    const { start, end } = getDayBounds();
    const nextWhere = {
      status: 'waiting',
      createdAt: { [Op.between]: [start, end] }
    };
    if (req.user.role !== 'admin' && req.user.departmentId) {
      nextWhere.departmentId = req.user.departmentId;
    }

    const nextTicket = await Ticket.findOne({
      where: nextWhere,
      order: [['ticketNumber', 'ASC']]
    });

    if (!nextTicket) {
      return res.status(404).json({ success: false, message: 'No waiting tickets in queue' });
    }

    const calledAt = new Date();
    const waitTime = getSecondsDiff(nextTicket.createdAt, calledAt);

    await nextTicket.update({
      status: 'serving',
      calledAt,
      waitTime,
      servedBy: req.user.id
    });

    await nextTicket.reload({
      include: [
        { model: User, as: 'server', attributes: ['id', 'fullName'], required: false }
      ]
    });

    try { await redisHelper.set('current', nextTicket, 3600); } catch(e) {}

    broadcastEvent('ticket:called', { ticket: nextTicket });
    logger.info(`Ticket called: #${nextTicket.ticketNumber} by ${req.user.fullName}`);

    res.json({ success: true, message: 'Ticket called successfully', data: nextTicket });
  } catch (error) { next(error); }
};

exports.completeTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'serving') {
      return res.status(400).json({ success: false, message: 'Only serving tickets can be completed' });
    }

    const completedAt = new Date();
    const serviceTime = getSecondsDiff(ticket.calledAt, completedAt);

    await ticket.update({ status: 'completed', completedAt, serviceTime, notes: notes || null });

    try { await redisHelper.del('current'); } catch(e) {}

    broadcastEvent('ticket:completed', { ticketId: id });
    logger.info(`Ticket completed: #${ticket.ticketNumber}`);

    res.json({ success: true, message: 'Ticket completed successfully', data: ticket });
  } catch (error) { next(error); }
};

exports.skipTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'serving') {
      return res.status(400).json({ success: false, message: 'Only serving tickets can be skipped' });
    }

    const completedAt = new Date();
    const serviceTime = getSecondsDiff(ticket.calledAt, completedAt);

    await ticket.update({
      status: 'cancelled',
      completedAt,
      serviceTime,
      notes: 'skipped'
    });

    try { await redisHelper.del('current'); } catch(e) {}

    broadcastEvent('ticket:cancelled', { ticketId: id });
    logger.info(`Ticket skipped: #${ticket.ticketNumber}`);

    res.json({ success: true, message: 'Ticket skipped', data: ticket });
  } catch (error) { next(error); }
};

exports.getCalledHistory = async (req, res, next) => {
  try {
    const { limit = 5 } = req.query;
    const { start, end } = getDayBounds();

    const where = {
      status: { [Op.in]: ['serving', 'completed'] },
      calledAt: { [Op.not]: null },
      createdAt: { [Op.between]: [start, end] }
    };
    if (req.user && req.user.role !== 'admin' && req.user.departmentId) {
      where.departmentId = req.user.departmentId;
    }

    const tickets = await Ticket.findAll({
      where,
      order: [['calledAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ success: true, data: tickets });
  } catch (error) { next(error); }
};