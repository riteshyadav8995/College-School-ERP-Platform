const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Boys', 'Girls'], required: true },
  program: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  totalRooms: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hostel', schema);
