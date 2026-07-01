const attendanceService = require('../services/attendanceService');

const markAttendance = async (req, res) => {
  try {
    const data = req.body;
    // Add markedBy user ID
    const attendanceData = Array.isArray(data) 
      ? data.map(item => ({ ...item, markedBy: req.user.id }))
      : { ...data, markedBy: req.user.id };

    const attendance = await attendanceService.markAttendance(attendanceData);
    res.status(201).json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const attendance = await attendanceService.getAttendance(req.query);
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAttendance = async (req, res) => {
  try {
    const attendance = await attendanceService.updateAttendance(req.params.id, req.body);
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getStudentStats = async (req, res) => {
  try {
    const { studentId } = req.query; // If admin viewing student
    const targetStudentId = studentId || (await require('../models/Student').findOne({ user: req.user.id }))?._id;
    if (!targetStudentId) return res.status(404).json({ message: 'Student not found' });
    
    // Using aggregation to calculate attendance percentage per course
    const Attendance = require('../models/Attendance');
    const stats = await Attendance.aggregate([
      { $match: { studentId: targetStudentId } },
      { $group: { 
          _id: "$courseId", 
          totalClasses: { $sum: 1 }, 
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } } 
        } 
      },
      { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
      { $unwind: "$course" }
    ]);
    
    res.json(stats.map(s => ({
      courseName: s.course.courseName,
      courseCode: s.course.courseCode,
      totalClasses: s.totalClasses,
      present: s.present,
      percentage: Math.round((s.present / s.totalClasses) * 100)
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFacultyStats = async (req, res) => {
  try {
    const { courseId } = req.query;
    const Attendance = require('../models/Attendance');
    const match = courseId ? { courseId: new require('mongoose').Types.ObjectId(courseId) } : {};
    
    const stats = await Attendance.aggregate([
      { $match: match },
      { $group: {
          _id: { courseId: "$courseId", facultyId: "$facultyId" },
          totalClasses: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } }
        }
      },
      { $lookup: { from: 'courses', localField: '_id.courseId', foreignField: '_id', as: 'course' } },
      { $unwind: "$course" },
      { $lookup: { from: 'teachers', localField: '_id.facultyId', foreignField: '_id', as: 'faculty' } },
      { $unwind: "$faculty" },
      { $lookup: { from: 'users', localField: 'faculty.user', foreignField: '_id', as: 'facultyUser' } },
      { $unwind: "$facultyUser" }
    ]);

    res.json(stats.map(s => ({
      courseName: s.course.courseName,
      courseCode: s.course.courseCode,
      facultyName: s.facultyUser.name,
      totalClasses: s.totalClasses,
      present: s.present,
      percentage: Math.round((s.present / s.totalClasses) * 100)
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { markAttendance, getAttendance, updateAttendance, getStudentStats, getFacultyStats };
