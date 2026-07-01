const Student = require('../models/Student');

const createStudent = async (data) => {
  const studentExists = await Student.findOne({ studentId: data.studentId });
  if (studentExists) throw new Error('Student with this ID already exists');
  return await Student.create(data);
};

const getStudents = async (query = {}) => {
  return await Student.find(query).populate('user', '-password').populate('department').populate('program');
};

const getStudentById = async (id) => {
  const student = await Student.findById(id).populate('user', '-password').populate('department').populate('program');
  if (!student) throw new Error('Student not found');
  return student;
};

const updateStudent = async (id, data) => {
  const oldStudent = await Student.findById(id);
  if (!oldStudent) throw new Error('Student not found');
  
  // Handle room transfer/assignment logic
  let shouldDecrementOldRoom = false;
  let shouldIncrementNewRoom = false;
  let oldRoomId = oldStudent.room;
  let newRoomId = data.room;

  // If status changes to Transferred or Alumni, vacate the room
  if (data.status && data.status !== 'Active' && oldStudent.status === 'Active' && oldRoomId) {
    shouldDecrementOldRoom = true;
    data.room = null;
    data.hostel = null;
    newRoomId = null;
  } else if (newRoomId && oldRoomId && newRoomId.toString() !== oldRoomId.toString()) {
    // Room changed
    shouldDecrementOldRoom = true;
    shouldIncrementNewRoom = true;
  } else if (newRoomId && !oldRoomId) {
    // New room assigned
    shouldIncrementNewRoom = true;
  } else if (!newRoomId && oldRoomId && data.room === null) {
    // Room removed manually
    shouldDecrementOldRoom = true;
  }

  const student = await Student.findByIdAndUpdate(id, data, { new: true });
  
  const Room = require('../models/Room');
  if (shouldDecrementOldRoom && oldRoomId) {
    await Room.findByIdAndUpdate(oldRoomId, { $inc: { occupied: -1 } });
  }
  if (shouldIncrementNewRoom && newRoomId) {
    await Room.findByIdAndUpdate(newRoomId, { $inc: { occupied: 1 } });
  }
  
  return student;
};

const deleteStudent = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) throw new Error('Student not found');
  return student;
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
