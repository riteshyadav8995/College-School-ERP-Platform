const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadSubmission, getSubmissionsByAssignment } = require('../controllers/submissionController');
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

router.post('/', protect, authorize('student'), upload.single('file'), uploadSubmission);
router.get('/:assignmentId', protect, authorize('teacher', 'admin', 'super_admin'), getSubmissionsByAssignment);

module.exports = router;
