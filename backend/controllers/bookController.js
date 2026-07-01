const bookService = require('../services/bookService');

const createBook = async (req, res) => {
  try {
    const data = { ...req.body, institution: req.user.institution };
    const book = await bookService.createBook(data);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getBooks = async (req, res) => {
  try {
    const query = { ...req.query, institution: req.user.institution };
    const books = await bookService.getBooks(query);
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    res.json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.json({ message: 'Book removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { createBook, getBooks, updateBook, deleteBook };
