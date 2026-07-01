const express = require('express');
const router = express.Router();
const { createBook, getBooks, updateBook, deleteBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('super_admin', 'admin', 'librarian'), createBook)
  .get(protect, getBooks);

router.route('/:id')
  .put(protect, authorize('super_admin', 'admin', 'librarian'), updateBook)
  .delete(protect, authorize('super_admin', 'admin', 'librarian'), deleteBook);

module.exports = router;
