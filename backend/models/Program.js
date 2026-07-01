const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, name: String, durationYears: Number, totalSemesters: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Program', schema);
