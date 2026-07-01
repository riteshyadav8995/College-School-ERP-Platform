const markService = require('../services/markService');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

const createMark = async (req, res) => {
  try {
    let teacherId = req.body.teacher;
    if (req.user.role === 'teacher') {
      let teacherProfile = await Teacher.findOne({ user: req.user.id });
      if (!teacherProfile) {
        teacherProfile = await Teacher.create({
          user: req.user.id,
          employeeId: `EMP${Date.now().toString().slice(-5)}`
        });
      }
      teacherId = teacherProfile._id;
    }
    
    const mark = await markService.createMark({ ...req.body, teacher: teacherId });
    res.status(201).json(mark);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMarks = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (studentProfile) filter.student = studentProfile._id;
    }
    const marks = await markService.getMarks(filter);
    res.json(marks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteMark = async (req, res) => {
  try {
    await markService.deleteMark(req.params.id);
    res.json({ message: 'Mark removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { createMark, getMarks, deleteMark };
