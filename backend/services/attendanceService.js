const Attendance = require('../models/Attendance');

const markAttendance = async (data) => {
  if (Array.isArray(data)) {
    return await Attendance.insertMany(data);
  }
  return await Attendance.create(data);
};

const getAttendance = async (query) => {
  return await Attendance.find(query).populate('student').populate('markedBy', 'name');
};

const updateAttendance = async (id, data) => {
  return await Attendance.findByIdAndUpdate(id, data, { new: true });
};

module.exports = { markAttendance, getAttendance, updateAttendance };
