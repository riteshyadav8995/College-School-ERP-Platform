const Submission = require('../models/Submission');
const Student = require('../models/Student');
const path = require('path');

const uploadSubmission = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { assignmentId } = req.body;
    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }

    // Get student profile
    const studentProfile = await Student.findOne({ user: req.user.id });
    if (!studentProfile) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentProfile._id,
      fileUrl: fileUrl,
      originalName: req.file.originalname
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSubmissionsByAssignment = async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate({
        path: 'student',
        populate: { path: 'user', select: 'name email' }
      });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { uploadSubmission, getSubmissionsByAssignment };
