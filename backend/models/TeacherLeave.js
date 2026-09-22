const mongoose = require('mongoose');
const sessionScope = require('../plugins/sessionScope');

const teacherLeaveSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  leaveType: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  appliedAt: { type: Date, default: Date.now },
  processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  processedAt: { type: Date }
});

teacherLeaveSchema.plugin(sessionScope);

module.exports = mongoose.model('TeacherLeave', teacherLeaveSchema);
