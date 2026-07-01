const timetableService = require('../services/timetableService');
const Timetable = require('../models/Timetable');

const createTimetable = async (req, res) => {
  try {
    const timetable = await timetableService.createTimetable({ ...req.body, institution: req.user.institution });
    res.status(201).json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTimetable = async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const Student = require('../models/Student');
    let filter = { ...req.query, institution: req.user.institution };
    
    if (req.user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ user: req.user.id });
      if (teacherProfile) filter.teacher = teacherProfile._id;
    } else if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (studentProfile) {
        const StudentCourse = require('../models/StudentCourse');
        const studentCourses = await StudentCourse.find({ studentId: studentProfile._id });
        const courseIds = studentCourses.map(sc => sc.courseId);

        const Course = require('../models/Course');
        const courses = await Course.find({ _id: { $in: courseIds } });
        const courseNames = courses.map(c => c.courseName);

        filter.$or = [
          { course: { $in: courseIds } },
          { subject: { $in: courseNames } },
          { 
            className: studentProfile.className,
            ...(studentProfile.section && { section: studentProfile.section })
          }
        ];
      }
    }

    const timetable = await timetableService.getTimetable(filter);
    
    // The service getTimetable populates 'teacher', but we also need the user name
    // Since service already does .populate('teacher'), let's re-populate user
    const populatedTimetable = await Timetable.populate(timetable, { path: 'teacher.user', select: 'name' });
    
    res.json(populatedTimetable);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTimetable = async (req, res) => {
  try {
    const timetable = await timetableService.updateTimetable(req.params.id, req.body);
    res.json(timetable);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTimetable = async (req, res) => {
  try {
    await timetableService.deleteTimetable(req.params.id);
    res.json({ message: 'Timetable entry removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { createTimetable, getTimetable, updateTimetable, deleteTimetable };
