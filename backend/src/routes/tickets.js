
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, optionalAuth, authorize } = require('../middlewares/auth');
const { validate, createTicketSchema } = require('../middlewares/validation');
const { ticketLimiter } = require('../middlewares/rateLimiter');

router.post('/', ticketLimiter, optionalAuth, validate(createTicketSchema), ticketController.createTicket);
router.get('/', authenticate, authorize('staff', 'admin'), ticketController.getTickets);
router.get('/:id', ticketController.getTicketById);
router.delete('/:id', authenticate, authorize('staff', 'admin'), ticketController.cancelTicket);

module.exports = router;