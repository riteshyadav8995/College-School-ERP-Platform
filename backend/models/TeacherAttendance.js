const mongoose = require('mongoose');
const sessionScope = require('../plugins/sessionScope');

const teacherAttendanceSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  status: { type: String, enum: ['Present', 'Absent', 'Leave', 'Late'], default: 'Present' },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

teacherAttendanceSchema.plugin(sessionScope);

module.exports = mongoose.model('TeacherAttendance', teacherAttendanceSchema);
