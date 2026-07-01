const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, 
  academicYear: String,
  courseCode: String, 
  courseName: String, 
  credits: Number, 
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', schema);
