const mongoose = require('mongoose');
const sessionScope = require('../plugins/sessionScope');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  name: String, amount: Number, criteria: String, status: { type: String, default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

schema.plugin(sessionScope);

module.exports = mongoose.model('Scholarship', schema);
