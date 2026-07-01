const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createAssignment, getAssignments, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.route('/')
  .post(protect, authorize('super_admin', 'admin', 'teacher'), upload.single('file'), createAssignment)
  .get(protect, getAssignments);

router.route('/:id')
  .put(protect, authorize('super_admin', 'admin', 'teacher'), upload.single('file'), updateAssignment)
  .delete(protect, authorize('super_admin', 'admin', 'teacher'), deleteAssignment);

module.exports = router;
