import jwt from 'jsonwebtoken';

const admin = (req, res, next) => {
  // The 'auth' middleware should run first to populate req.user
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};

export default admin;