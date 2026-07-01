const express = require('express');
const router = express.Router();
const { markAttendance } = require('../controllers/teacherAttendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher'), markAttendance);

module.exports = router;
