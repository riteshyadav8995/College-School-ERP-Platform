const express = require('express');
const router = express.Router();
const { issueBook, returnBook, getIssuedBooks } = require('../controllers/bookIssueController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('librarian', 'admin', 'super_admin'), issueBook)
  .get(protect, getIssuedBooks);

router.route('/:id/return')
  .put(protect, authorize('librarian', 'admin', 'super_admin'), returnBook);

module.exports = router;
