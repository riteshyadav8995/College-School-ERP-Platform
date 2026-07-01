const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Free, Basic, Professional, Enterprise
  price: { type: Number, required: true, default: 0 },
  maxStudents: { type: Number, required: true, default: 100 },
  maxTeachers: { type: Number, required: true, default: 10 },
  storageLimit: { type: Number, required: true, default: 5 }, // In GB
  aiFeatures: { type: Boolean, default: false },
  smsCredits: { type: Number, default: 0 },
  whatsappCredits: { type: Number, default: 0 },
  apiAccess: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SubscriptionPlan', schema);

