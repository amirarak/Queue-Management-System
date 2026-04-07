const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, authorize } = require('../middlewares/auth');
const { analyticsExportLimiter } = require('../middlewares/rateLimiter');
const {
	validateQuery,
	analyticsPeriodQuerySchema,
	analyticsExportQuerySchema
} = require('../middlewares/validation');

router.get('/today', authenticate, authorize('staff', 'admin'), analyticsController.getTodayStats);
router.get('/period', authenticate, authorize('staff', 'admin'), validateQuery(analyticsPeriodQuerySchema), analyticsController.getPeriodStats);
router.get('/export', authenticate, authorize('admin'), analyticsExportLimiter, validateQuery(analyticsExportQuerySchema), analyticsController.exportReport);
router.post('/save-daily', authenticate, authorize('admin'), analyticsController.saveDailyAnalytics);

module.exports = router;