const express = require('express');
const router = express.Router();
const { createMark, getMarks, deleteMark } = require('../controllers/markController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('admin', 'teacher', 'super_admin'), createMark)
  .get(protect, getMarks);

router.route('/:id')
  .delete(protect, authorize('admin', 'teacher', 'super_admin'), deleteMark);

module.exports = router;
