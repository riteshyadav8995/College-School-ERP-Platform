const express = require('express');
const router = express.Router();
const { 
  getInstitutions, 
  createInstitution, 
  updateInstitution, 
  deleteInstitution 
} = require('../controllers/institutionController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('super_admin'));

router.get('/', getInstitutions);
router.post('/', createInstitution);
router.put('/:id', updateInstitution);
router.delete('/:id', deleteInstitution);

module.exports = router;
