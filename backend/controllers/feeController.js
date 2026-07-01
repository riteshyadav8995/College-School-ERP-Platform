const feeService = require('../services/feeService');
const Student = require('../models/Student');

const createFee = async (req, res) => {
  try {
    const fee = await feeService.createFee(req.body);
    res.status(201).json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFees = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (studentProfile) {
        query.student = studentProfile._id;
      } else {
        return res.json([]);
      }
    }
    const fees = await feeService.getFees(query);
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRazorpayOrder = async (req, res) => {
  try {
    const order = await feeService.createRazorpayOrder(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { paymentId, signature } = req.body;
    const fee = await feeService.verifyPayment(req.params.id, paymentId, signature);
    res.json({ message: 'Payment verified successfully', fee });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createFee, getFees, createRazorpayOrder, verifyPayment };
