const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  
  // Academic (Admin Managed)
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  assignedSubjects: [{ type: String }],
  assignedClasses: [{ type: String }],

  // HR Managed
  qualification: { type: String },
  experience: { type: Number }, // in years
  salary: { type: Number },
  joiningDate: { type: Date, default: Date.now },
  pfNumber: { type: String },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },

  // Personal (Teacher Managed)
  mobile: { type: String },
  address: { type: String },
  photo: { type: String },
  
  createdAt: { type: Date, default: Date.now }
});

teacherSchema.index({ employeeId: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model('Teacher', teacherSchema);
