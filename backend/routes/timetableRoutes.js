const express = require('express');
const router = express.Router();
const { createTimetable, getTimetable, updateTimetable, deleteTimetable } = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin'), createTimetable)
  .get(protect, getTimetable);

router.route('/:id')
  .put(protect, authorize('super_admin', 'admin'), updateTimetable)
  .delete(protect, authorize('super_admin', 'admin'), deleteTimetable);

module.exports = router;
