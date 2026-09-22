const mongoose = require('mongoose');
const sessionScope = require('../plugins/sessionScope');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  company: String, role: String, package: String, date: String,
  studentsPlaced: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

schema.plugin(sessionScope);

module.exports = mongoose.model('Placement', schema);
