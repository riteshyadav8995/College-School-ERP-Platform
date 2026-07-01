const Fee = require('../models/Fee');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
});

const createFee = async (data) => {
  return await Fee.create(data);
};

const getFees = async (query) => {
  return await Fee.find(query).populate({
    path: 'student',
    populate: { path: 'user', select: 'name email' }
  });
};

const createRazorpayOrder = async (feeId) => {
  const fee = await Fee.findById(feeId);
  if (!fee) throw new Error('Fee record not found');
  if (fee.status === 'Paid') throw new Error('Fee is already paid');

  const options = {
    amount: fee.amount * 100, // amount in paise
    currency: "INR",
    receipt: `receipt_${fee._id}`
  };

  const order = await razorpay.orders.create(options);
  fee.razorpayOrderId = order.id;
  await fee.save();

  return order;
};

const verifyPayment = async (feeId, paymentId, signature) => {
  const fee = await Fee.findById(feeId);
  if (!fee) throw new Error('Fee record not found');

  fee.status = 'Paid';
  fee.razorpayPaymentId = paymentId;
  fee.paymentDate = Date.now();
  await fee.save();

  return fee;
};

module.exports = { createFee, getFees, createRazorpayOrder, verifyPayment };
