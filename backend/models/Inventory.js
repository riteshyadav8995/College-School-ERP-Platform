const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  itemName: String, quantity: Number, unitPrice: Number, category: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', schema);
