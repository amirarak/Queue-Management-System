const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { authenticate } = require('../middlewares/auth');

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
}

router.get('/', authenticate, adminOnly, async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'fullName', 'role', 'isActive', 'isVerified', 'lastLogin', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (e) { next(e); }
});

router.put('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (String(user.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot modify your own account here' });
    }

    const { fullName, role, isActive } = req.body;
    await user.update({
      ...(fullName  !== undefined && { fullName }),
      ...(role      !== undefined && { role }),
      ...(isActive  !== undefined && { isActive })
    });

    res.json({ success: true, message: 'User updated', data: user });
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, adminOnly, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (String(user.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (e) { next(e); }
});

module.exports = router;