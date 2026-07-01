const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['super_admin', 'admin', 'hr', 'teacher', 'student', 'parent', 'accountant', 'librarian'],
    required: true 
  },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
