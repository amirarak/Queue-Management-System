const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const { printTicket } = require('../services/printService');

router.post('/ticket', async (req, res, next) => {
  try {
    const ticket = req.body || {};

    if (!ticket.ticketCode && !ticket.ticketNumber) {
      return res.status(400).json({ success: false, message: 'ticketCode or ticketNumber is required' });
    }

    await printTicket(ticket);

    logger.info(`Ticket sent to printer: ${ticket.ticketCode || ticket.ticketNumber}`);

    res.json({ success: true, message: 'Ticket printed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;