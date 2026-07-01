const express = require('express');
const router = express.Router();
const { applyLeave, getLeaves, processLeave } = require('../controllers/teacherLeaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('teacher'), applyLeave);
router.get('/', protect, authorize('admin', 'hr', 'teacher'), getLeaves);
router.put('/:id', protect, authorize('admin', 'hr'), processLeave);

module.exports = router;
