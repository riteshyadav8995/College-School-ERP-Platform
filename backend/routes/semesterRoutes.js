const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/semesterController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.route('/').get(getAll).post(create);
router.route('/:id').put(update).delete(remove);

module.exports = router;
