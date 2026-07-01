const Institution = require('../models/Institution');
const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Billing = require('../models/Billing');
const Setting = require('../models/Setting');
const bcrypt = require('bcryptjs');

const getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().populate('subscriptionPlan');
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createInstitution = async (req, res) => {
  try {
    const { 
      name, shortForm, institutionType, logo, address, state, country, 
      contactEmail, phone, website, principalDirector, subscriptionPlan, 
      adminName, adminEmail, adminPassword 
    } = req.body;
    
    // Find Subscription Plan
    let planId = subscriptionPlan;
    let plan = null;
    if (planId) {
      plan = await SubscriptionPlan.findById(planId);
    } else {
      // Find a default Free or Basic plan
      plan = await SubscriptionPlan.findOne({ name: 'Basic' }) || await SubscriptionPlan.findOne();
      planId = plan ? plan._id : null;
    }

    // Create Institution
    const institution = await Institution.create({
      name, shortForm, institutionType, logo, address, state, country, 
      contactEmail, phone, website, principalDirector, subscriptionPlan: planId
    });

    // Create Default Settings
    await Setting.create({
      institution: institution._id,
      academicYear: '2026-27',
      semester: 'Monsoon'
    });
    
    // Create Initial Billing Record if Plan is paid
    if (plan && plan.price > 0) {
      await Billing.create({
        institution: institution._id,
        plan: plan._id,
        amount: plan.price,
        invoiceNumber: `INV-${Date.now()}`
      });
    }

    // Create School Admin for this Institution
    if (adminEmail && adminPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      await User.create({
        name: adminName || 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        institution: institution._id
      });
    }

    const savedInst = await Institution.findById(institution._id).populate('subscriptionPlan');
    res.status(201).json(savedInst);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateInstitution = async (req, res) => {
  try {
    const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('subscriptionPlan');
    res.json(institution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteInstitution = async (req, res) => {
  try {
    await Institution.findByIdAndDelete(req.params.id);
    res.json({ message: 'Institution deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getInstitutions, createInstitution, updateInstitution, deleteInstitution };
