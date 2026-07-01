const express = require('express');
const router = express.Router();
const { markAttendance, getAttendance, updateAttendance } = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin', 'teacher'), markAttendance)
  .get(protect, getAttendance);

router.get('/stats/student', protect, authorize('student'), require('../controllers/attendanceController').getStudentStats);
router.get('/stats/faculty', protect, authorize('super_admin', 'admin', 'teacher'), require('../controllers/attendanceController').getFacultyStats);

router.route('/:id')
  .put(protect, authorize('super_admin', 'admin', 'teacher'), updateAttendance);

module.exports = router;
