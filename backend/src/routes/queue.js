const express = require('express');
const router  = express.Router();
const queueController = require('../controllers/queueController');
const { authenticate, optionalAuth, authorize } = require('../middlewares/auth');

router.get('/',         optionalAuth, queueController.getQueue);
router.get('/current',  optionalAuth, queueController.getCurrentTicket);
router.get('/serving',  optionalAuth, queueController.getServingTickets); 
router.get('/history',  optionalAuth, queueController.getCalledHistory);

router.post('/call-next',   authenticate, authorize('staff', 'admin'), queueController.callNextTicket);
router.put('/:id/complete', authenticate, authorize('staff', 'admin'), queueController.completeTicket);
router.put('/:id/skip',     authenticate, authorize('staff', 'admin'), queueController.skipTicket);

module.exports = router;