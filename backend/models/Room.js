const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  hostel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
  roomNumber: { type: String, required: true },
  floor: { type: String, default: 'Ground' },
  capacity: { type: Number, required: true },
  occupied: { type: Number, default: 0 },
  shareKey: { type: String, default: null },
  keyGeneratedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', schema);
