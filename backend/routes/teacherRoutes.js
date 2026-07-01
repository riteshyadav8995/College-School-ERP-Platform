const express = require('express');
const router = express.Router();
const { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher } = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin'), createTeacher)
  .get(protect, getTeachers); // Everyone authenticated might need to view teachers

router.route('/:id')
  .get(protect, getTeacherById)
  .put(protect, authorize('super_admin', 'admin'), updateTeacher)
  .delete(protect, authorize('super_admin', 'admin'), deleteTeacher);

module.exports = router;
