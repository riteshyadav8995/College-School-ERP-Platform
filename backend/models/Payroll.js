const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }, basicSalary: Number, month: String, status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payroll', schema);
