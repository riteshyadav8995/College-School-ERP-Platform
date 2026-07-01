const BookIssue = require('../models/BookIssue');
const Book = require('../models/Book');
const Student = require('../models/Student');

const calculateFine = (dueDate) => {
  const now = new Date();
  if (now > new Date(dueDate)) {
    const diffTime = Math.abs(now - new Date(dueDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays * 5; // 5 rupees per day
  }
  return 0;
};

const issueBook = async (req, res) => {
  try {
    const { bookId, studentId, returnDays } = req.body;
    
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    if (book.availableCopies <= 0) return res.status(400).json({ message: 'No copies available' });

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const days = returnDays || 14; // Default 14 days
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const issue = await BookIssue.create({
      book: bookId,
      student: studentId,
      dueDate
    });

    // Decrease available copies
    book.availableCopies -= 1;
    await book.save();

    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const returnBook = async (req, res) => {
  try {
    const issue = await BookIssue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue record not found' });
    if (issue.status === 'Returned') return res.status(400).json({ message: 'Book already returned' });

    issue.status = 'Returned';
    issue.returnedAt = new Date();
    
    // Calculate final fine
    if (new Date() > issue.dueDate) {
       issue.fine = calculateFine(issue.dueDate);
    }
    
    await issue.save();

    // Increase available copies
    const book = await Book.findById(issue.book);
    if (book) {
      book.availableCopies += 1;
      await book.save();
    }

    res.json(issue);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getIssuedBooks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (!studentProfile) return res.json([]);
      query.student = studentProfile._id;
    }

    let issues = await BookIssue.find(query)
      .populate('book')
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      })
      .sort('-issueDate');

    // Dynamically calculate fines for unreturned books
    issues = issues.map(issue => {
      const issueObj = issue.toObject();
      if (issueObj.status === 'Issued') {
        issueObj.fine = calculateFine(issueObj.dueDate);
      }
      return issueObj;
    });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { issueBook, returnBook, getIssuedBooks };
