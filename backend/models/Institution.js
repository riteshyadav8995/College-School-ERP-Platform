const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  shortForm: { type: String, required: true, uppercase: true }, // e.g., IITP
  institutionType: { type: String, enum: ['School', 'College', 'University'], default: 'School' },
  logo: { type: String },
  address: { type: String },
  state: { type: String },
  country: { type: String },
  contactEmail: { type: String },
  phone: { type: String },
  website: { type: String },
  principalDirector: { type: String },
  subscriptionPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan' },
  subscriptionEndDate: { type: Date },
  status: { type: String, enum: ['Active', 'Suspended', 'Trial', 'Inactive'], default: 'Active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institution', institutionSchema);
