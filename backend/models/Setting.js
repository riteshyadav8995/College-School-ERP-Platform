const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true, unique: true },
  academicYear: { type: String, default: '2026-27' },
  semester: { type: String, default: 'Monsoon' },
  academicYears: { type: [String], default: ['2026-27'] },
  semesters: { type: [String], default: ['Monsoon', 'Spring'] }
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
