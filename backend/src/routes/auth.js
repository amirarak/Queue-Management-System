const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
	validate,
	registerSchema,
	loginSchema,
	setPasswordSchema,
	forgotPasswordSchema,
	changePasswordSchema
} = require('../middlewares/validation');


router.post('/register',         authLimiter, validate(registerSchema), authController.register);
router.post('/login',            authLimiter, validate(loginSchema), authController.login);
router.post('/set-password',     authLimiter, validate(setPasswordSchema), authController.setPassword);
router.post('/forgot-password',  authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.get('/verify/:token',     authController.verifyEmail);


router.get('/me',                authenticate, authController.me);
router.post('/logout',           authenticate, authController.logout);
router.put('/change-password',   authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;