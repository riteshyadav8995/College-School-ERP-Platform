const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  studentId: { type: String, required: true },
  rollNumber: { type: String },
  className: { type: String }, // 'class' is a reserved keyword in JS sometimes better to use className
  section: { type: String },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' },
  year: { type: String },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Male' },
  endCourseDate: { type: Date },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  status: { type: String, enum: ['Active', 'Transferred', 'Alumni'], default: 'Active' },
  address: { type: String },
  parentDetails: {
    fatherName: String,
    motherName: String,
    contactNumber: String
  },
  documents: {
    marksheet10: String,
    marksheet12: String,
    aadharCard: String,
    photo: String
  },
  createdAt: { type: Date, default: Date.now }
});

studentSchema.index({ studentId: 1, institution: 1 }, { unique: true });
studentSchema.index({ rollNumber: 1, institution: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Student', studentSchema);
