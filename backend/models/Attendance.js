const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  lectureNumber: { type: Number, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Excused'], required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Compound index to prevent duplicate attendance records for a student for the same lecture
attendanceSchema.index({ courseId: 1, studentId: 1, date: 1, lectureNumber: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
