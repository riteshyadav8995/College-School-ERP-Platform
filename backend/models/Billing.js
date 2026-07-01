const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Paid', 'Pending', 'Failed'], default: 'Paid' },
  invoiceNumber: { type: String, required: true, unique: true }
});

module.exports = mongoose.model('Billing', schema);

