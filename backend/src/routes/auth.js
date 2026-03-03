const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

router.post('/register', authController.register);           
router.post('/login', authController.login);
router.post('/set-password', authController.setPassword);  
router.get('/verify/:token', authController.verifyEmail);   

router.get('/me', authenticate, authController.me);
router.post('/logout', authenticate, authController.logout);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;