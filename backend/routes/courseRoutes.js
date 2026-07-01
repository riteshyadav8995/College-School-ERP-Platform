const express = require('express');
const router = express.Router();
const { getAll, create, update, remove, getAvailableCourses } = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/').get(authorize('admin', 'super_admin', 'teacher'), getAll).post(authorize('admin', 'super_admin'), create);
router.route('/available').get(authorize('student'), getAvailableCourses);
router.route('/:id').put(authorize('admin', 'super_admin'), update).delete(authorize('admin', 'super_admin'), remove);

module.exports = router;
