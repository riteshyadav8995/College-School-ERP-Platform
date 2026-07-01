const express = require('express');
const router = express.Router();
const { createFee, getFees, createRazorpayOrder, verifyPayment } = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin', 'accountant'), createFee)
  .get(protect, getFees);

router.post('/:id/order', protect, createRazorpayOrder);
router.post('/:id/verify', protect, verifyPayment);

module.exports = router;
