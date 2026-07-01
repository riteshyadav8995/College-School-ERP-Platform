const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }, semesterNumber: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Semester', schema);
