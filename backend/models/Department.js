const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  description: { type: String },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now }
});

departmentSchema.index({ name: 1, institution: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
