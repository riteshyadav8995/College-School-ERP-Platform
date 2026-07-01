const assignmentService = require('../services/assignmentService');
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Notification = require('../models/Notification');

const createAssignment = async (req, res) => {
  try {
    let teacherId = req.body.teacher;
    if (req.user.role === 'teacher') {
      let teacherProfile = await Teacher.findOne({ user: req.user.id });
      if (!teacherProfile) {
        teacherProfile = await Teacher.create({
          user: req.user.id,
          employeeId: `EMP${Date.now().toString().slice(-5)}`,
          institution: req.user.institution
        });
      }
      teacherId = teacherProfile._id;
    }

    let fileUrl = '';
    if (req.file) {
      fileUrl = '/uploads/' + req.file.filename;
    }

    const assignmentData = { ...req.body, teacher: teacherId, institution: req.user.institution };
    if (fileUrl) assignmentData.fileUrl = fileUrl;

    const assignment = await assignmentService.createAssignment(assignmentData);

    // Notify enrolled students
    if (assignment.course) {
      const course = await Course.findById(assignment.course).populate('semesterId');
      if (course && course.semesterId) {
        let targetYear = '';
        const sem = course.semesterId.semesterNumber;
        if(sem <= 2) targetYear = '1st Year';
        else if(sem <= 4) targetYear = '2nd Year';
        else if(sem <= 6) targetYear = '3rd Year';
        else if(sem <= 8) targetYear = '4th Year';
        else targetYear = '5th Year';

        const students = await Student.find({ program: course.semesterId.programId, year: targetYear });
        const notifications = students.map(student => ({
          institution: assignment.institution,
          recipient: student.user,
          title: 'New Assignment Created',
          message: `A new assignment "${assignment.title}" has been posted.`,
          type: 'assignment'
        }));
        if (notifications.length > 0) {
          await Notification.insertMany(notifications);
        }
      }
    }

    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAssignments = async (req, res) => {
  try {
    let query = { ...req.query };
    if (req.user.role === 'student') {
      const studentProfile = await Student.findOne({ user: req.user.id });
      if (studentProfile && studentProfile.program && studentProfile.year) {
        let semesterNumbers = [];
        if(studentProfile.year === '1st Year') semesterNumbers = [1,2];
        else if(studentProfile.year === '2nd Year') semesterNumbers = [3,4];
        else if(studentProfile.year === '3rd Year') semesterNumbers = [5,6];
        else if(studentProfile.year === '4th Year') semesterNumbers = [7,8];
        else if(studentProfile.year === '5th Year') semesterNumbers = [9,10];

        const Semester = require('../models/Semester');
        const semesters = await Semester.find({ programId: studentProfile.program, semesterNumber: { $in: semesterNumbers } });
        const semesterIds = semesters.map(s => s._id);
        
        const courses = await Course.find({ semesterId: { $in: semesterIds } });
        const courseIds = courses.map(c => c._id);
        
        query.course = { $in: courseIds };
      } else {
        return res.json([]);
      }
    }
    const assignments = await assignmentService.getAssignments(query);
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignmentData = { ...req.body };
    if (req.file) {
      assignmentData.fileUrl = '/uploads/' + req.file.filename;
    }
    const assignment = await assignmentService.updateAssignment(req.params.id, assignmentData);
    res.json(assignment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    res.json({ message: 'Assignment removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = { createAssignment, getAssignments, updateAssignment, deleteAssignment };
