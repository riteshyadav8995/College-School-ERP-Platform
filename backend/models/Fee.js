const mongoose = require('mongoose');
const sessionScope = require('../plugins/sessionScope');

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true }, // e.g., "Term 1 Fee"
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending' },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  paymentDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

feeSchema.plugin(sessionScope);

module.exports = mongoose.model('Fee', feeSchema);
