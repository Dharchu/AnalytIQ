import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/authMiddleware.js';
import admin from '../middleware/adminMiddleware.js';

const router = express.Router();

// @route   GET api/users
// @desc    Get all users
// @access  Private/Admin
router.get('/', [auth, admin], async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // Don't send back the password
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/:id/role', [auth, admin], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = req.body.role || user.role;
    await user.save();
    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;