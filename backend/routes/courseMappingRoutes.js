const express = require('express');
const router = express.Router();
const courseMappingController = require('../controllers/courseMappingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/faculty', protect, authorize('super_admin', 'admin'), courseMappingController.assignFaculty);
router.post('/student', protect, authorize('super_admin', 'admin'), courseMappingController.registerStudent);
router.get('/student/me', protect, authorize('student'), courseMappingController.getMyEnrolledCourses);
router.get('/student/:courseId', protect, courseMappingController.getCourseStudents);
router.get('/faculty/me', protect, authorize('teacher'), courseMappingController.getMyCourses);
router.post('/enroll', protect, authorize('student'), courseMappingController.enrollStudent);

module.exports = router;
