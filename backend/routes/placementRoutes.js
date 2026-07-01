const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/placementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'super_admin', 'student'), getAll)
  .post(authorize('admin', 'super_admin'), create);
  
router.route('/:id')
  .put(authorize('admin', 'super_admin'), update)
  .delete(authorize('admin', 'super_admin'), remove);

module.exports = router;
