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
    // If direct printing is not supported on this platform (e.g. server runs on Linux),
    // return a friendly JSON response instead of propagating a 500. This lets the
    // frontend show an informative message without a 500 status code.
    if (error && String(error.message || '').includes('Direct printing is supported only on Windows')) {
      logger.info('Print request received on non-Windows host - direct printing unavailable');
      return res.json({ success: false, message: 'Direct printing is supported only on Windows' });
    }

    next(error);
  }
});

module.exports = router;