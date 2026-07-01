const authService = require('../services/authService');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const userData = await authService.registerUser(req.body);
    res.status(201).json(userData);
  } catch (error) {
    const statusCode = error.message === 'User already exists' || error.message === 'Please add all fields' || error.message === 'Invalid user data' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const userData = await authService.loginUser(email, password);
    res.json(userData);
  } catch (error) {
    const statusCode = error.message === 'Invalid credentials' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    // req.user is set by authMiddleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    const result = await authService.changePassword(req.user._id, oldPassword, newPassword);
    res.json(result);
  } catch (error) {
    const statusCode = error.message === 'Incorrect old password' ? 400 : 500;
    res.status(statusCode).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};
