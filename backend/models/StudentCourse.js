const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  academicYear: { type: String, required: true },
  semester: { type: Number, required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  createdAt: { type: Date, default: Date.now }
});

schema.index({ studentId: 1, courseId: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('StudentCourse', schema);
