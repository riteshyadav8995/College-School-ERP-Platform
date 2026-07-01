const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { createStudent, getStudents, getStudentById, updateStudent, deleteStudent, getStudentProfile, updateStudentProfile, selfAssignRoom, joinRoomByKey } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'student-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.route('/')
  .post(protect, authorize('super_admin', 'admin'), createStudent)
  .get(protect, authorize('super_admin', 'admin', 'teacher'), getStudents);

router.route('/profile')
  .get(protect, authorize('student'), getStudentProfile)
  .put(protect, authorize('student'), upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'marksheet10', maxCount: 1 },
    { name: 'marksheet12', maxCount: 1 },
    { name: 'aadharCard', maxCount: 1 },
    { name: 'casteCertificate', maxCount: 1 },
    { name: 'domicileCertificate', maxCount: 1 }
  ]), updateStudentProfile);

router.put('/profile/room-assign', protect, authorize('student'), selfAssignRoom);
router.put('/profile/room-join', protect, authorize('student'), joinRoomByKey);

router.route('/:id')
  .get(protect, getStudentById)
  .put(protect, authorize('super_admin', 'admin'), updateStudent)
  .delete(protect, authorize('super_admin', 'admin'), deleteStudent);

module.exports = router;
