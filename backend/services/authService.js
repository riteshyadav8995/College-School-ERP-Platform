const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (userData) => {
  const { name, email, password, role, institution } = userData;

  if (!name || !email || !password || !role) {
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  if (role === 'student' && userData.rollNumber) {
    const Student = require('../models/Student');
    const existingStudent = await Student.findOne({ rollNumber: userData.rollNumber, institution });
    if (existingStudent) {
      throw new Error('Roll Number already exists in this institution');
    }
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    institution,
  });

  // Automatically create associated profiles for ease of testing
  if (role === 'student') {
    const Student = require('../models/Student');
    await Student.create({
      user: user._id,
      institution,
      department: userData.department,
      program: userData.program,
      year: userData.year,
      studentId: `SID${Date.now().toString().slice(-5)}`,
      rollNumber: userData.rollNumber || `STU${Date.now().toString().slice(-5)}`,
      className: 'B.tech 1st year', // Adjusted default class
      section: 'A',
      hostel: userData.hostel || null,
      room: userData.room || null
    });

    if (userData.room) {
      const Room = require('../models/Room');
      await Room.findByIdAndUpdate(userData.room, { $inc: { occupied: 1 } });
    }
  } else if (role === 'teacher') {
    const Teacher = require('../models/Teacher');
    await Teacher.create({
      user: user._id,
      institution,
      department: userData.department,
      employeeId: `EMP${Date.now().toString().slice(-5)}`
    });
  }

  if (user) {
    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    };
  } else {
    throw new Error('Invalid user data');
  }
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email }).populate('institution');

  if (user && (await bcrypt.compare(password, user.password))) {
    user.lastLogin = Date.now();
    await user.save();

    let settings = null;
    if (user.institution && user.institution._id) {
      const Setting = require('../models/Setting');
      settings = await Setting.findOne({ institution: user.institution._id });
    }

    return {
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      institution: user.institution,
      settings: settings,
      token: generateToken(user._id, user.role),
    };
  } else {
    throw new Error('Invalid credentials');
  }
};

const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if old password matches
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error('Incorrect old password');
  }

  // Hash new password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: 'Password updated successfully' };
};

module.exports = {
  registerUser,
  loginUser,
  changePassword,
};
