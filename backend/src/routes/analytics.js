const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/today', authenticate, authorize('staff', 'admin'), analyticsController.getTodayStats);
router.get('/period', authenticate, authorize('staff', 'admin'), analyticsController.getPeriodStats);
router.get('/export', authenticate, authorize('admin'), analyticsController.exportReport);
router.post('/save-daily', authenticate, authorize('admin'), analyticsController.saveDailyAnalytics);

module.exports = router;