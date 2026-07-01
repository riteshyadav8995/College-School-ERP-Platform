const express = require('express');
const router = express.Router();
const { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin'), createDepartment)
  .get(protect, getDepartments);

router.route('/:id')
  .get(protect, getDepartmentById)
  .put(protect, authorize('super_admin', 'admin'), updateDepartment)
  .delete(protect, authorize('super_admin', 'admin'), deleteDepartment);

module.exports = router;
