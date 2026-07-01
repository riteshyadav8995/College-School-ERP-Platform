const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Program = require('../models/Program');
const Department = require('../models/Department');

const getAll = async (req, res) => {
  try {
    let query = { institution: req.user.institution };
    if (req.user.role === 'teacher') {
      const Teacher = require('../models/Teacher');
      const teacherProfile = await Teacher.findOne({ user: req.user.id });
      if (teacherProfile) {
        query.teacherId = teacherProfile._id;
      }
    }
    const data = await Course.find(query)
      .populate({
        path: 'semesterId',
        populate: {
          path: 'programId',
          populate: { path: 'departmentId' }
        }
      })
      .populate({
        path: 'teacherId',
        populate: { path: 'user' }
      });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newData = new Course({ ...req.body, institution: req.user.institution });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await Course.findOneAndUpdate(
      { _id: req.params.id, institution: req.user.institution },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await Course.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAvailableCourses = async (req, res) => {
  try {
    const Student = require('../models/Student');
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    const allCourses = await Course.find({ institution: req.user.institution })
      .populate('departmentId programId')
      .populate({
        path: 'semesterId',
        populate: {
          path: 'programId',
          populate: { path: 'departmentId' }
        }
      })
      .populate({
        path: 'teacherId',
        populate: { path: 'user' }
      });

    const filtered = allCourses.filter(course => {
      // Determine effective department and program for the course
      const courseDeptId = course.departmentId?._id?.toString() || course.semesterId?.programId?.departmentId?._id?.toString();
      const courseProgId = course.programId?._id?.toString() || course.semesterId?.programId?._id?.toString();

      // Check against student's department (only if student has a department)
      if (student.department && courseDeptId && courseDeptId !== student.department.toString()) {
        return false;
      }

      // Check against student's program (only if student has a program)
      if (student.program && courseProgId && courseProgId !== student.program.toString()) {
        return false;
      }

      return true;
    });

    console.log(`[DEBUG] Found ${filtered.length} courses for student.`);
    res.json(filtered);
  } catch (error) {
    console.error('[DEBUG Error]', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAll, create, update, remove, getAvailableCourses };
