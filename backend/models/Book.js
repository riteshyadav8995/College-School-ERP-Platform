const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  bookId: { type: String, required: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String },
  category: { type: String, default: 'General' },
  rack: { type: String, default: 'Not Assigned' },
  totalCopies: { type: Number, required: true },
  availableCopies: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', bookSchema);
