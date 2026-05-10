const { Ticket, User, Department } = require('../models');
const { redisHelper } = require('../config/redis');
const logger = require('../utils/logger');
const { broadcastEvent } = require('../services/websocketService');
const { Op } = require('sequelize');
const { getPaginationParams, paginatedResponse, getDayBounds } = require('../utils/helpers');

exports.createTicket = async (req, res, next) => {
  try {
    const { studentName, purposeKey, purpose, serviceTypeId, departmentId } = req.body;

    const finalPurposeKey = purposeKey || purpose;

    if (!finalPurposeKey) {
      return res.status(400).json({ success: false, message: 'purposeKey is required' });
    }
    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'departmentId is required' });
    }

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    const { start, end } = getDayBounds();

    const lastTicket = await Ticket.findOne({
      where: { departmentId, createdAt: { [Op.between]: [start, end] } },
      order: [['ticketNumber', 'DESC']]
    });

    const ticketNumber = lastTicket ? lastTicket.ticketNumber + 1 : 1;
    const ticketCode   = `${department.code}-${ticketNumber}`;

    const ticket = await Ticket.create({
      ticketNumber,
      ticketCode,
      studentName: studentName || 'Студент',
      purposeKey:  finalPurposeKey,
      purpose:     finalPurposeKey,
      departmentId,
      serviceTypeId: serviceTypeId || null,
      status: 'waiting'
    });

    const ticketData = ticket.toJSON();
    ticketData.department = {
      id: department.id,
      code: department.code,
      nameRu: department.nameRu,
      nameEn: department.nameEn,
      nameKy: department.nameKy
    };

    try {
      broadcastEvent('ticket:created', { ticket: ticketData, departmentId });
      logger.info(`Ticket created: ${ticketCode}`);
    } catch (e) {
      logger.warn('Failed to broadcast ticket:created event', { error: e?.message || e });
    }

    res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticketData });
  } catch (error) { next(error); }
};

exports.getTickets = async (req, res, next) => {
  try {
    const { status, date, page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPaginationParams({ page, limit });

    const where = {};
    if (status) where.status = status;

    const user = await User.findByPk(req.user.id);
    if (user?.departmentId && req.user.role !== 'admin') {
      where.departmentId = user.departmentId;
    }

    const targetDate = date ? new Date(date) : new Date();
    const { start, end } = getDayBounds(targetDate);
    where.createdAt = { [Op.between]: [start, end] };

    const { count, rows } = await Ticket.findAndCountAll({
      where,
      include: [
        { model: User,       as: 'server',     attributes: ['id','fullName'], required: false },
        { model: Department, as: 'department', attributes: ['id','code','nameRu','nameEn','nameKy'], required: false }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset
    });

    res.json(paginatedResponse(rows, pageNum, limitNum, count));
  } catch (error) { next(error); }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User,       as: 'server',     attributes: ['id','fullName'], required: false },
        { model: Department, as: 'department', attributes: ['id','code','nameRu','nameEn'], required: false }
      ]
    });
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    res.json({ success: true, data: ticket });
  } catch (error) { next(error); }
};

exports.cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });
    if (ticket.status !== 'waiting') {
      return res.status(400).json({ success: false, message: 'Only waiting tickets can be cancelled' });
    }
    await ticket.update({ status: 'cancelled' });
    broadcastEvent('ticket:cancelled', { ticketId: req.params.id, departmentId: ticket.departmentId });
    res.json({ success: true, message: 'Ticket cancelled', data: ticket });
  } catch (error) { next(error); }
};