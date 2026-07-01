const Teacher = require('../models/Teacher');

const createTeacher = async (data) => {
  const teacherExists = await Teacher.findOne({ employeeId: data.employeeId });
  if (teacherExists) throw new Error('Teacher with this Employee ID already exists');
  return await Teacher.create(data);
};

const getTeachers = async (institutionId) => {
  let query = {};
  if (institutionId) query.institution = institutionId;
  return await Teacher.find(query).populate('user', '-password').populate('department');
};

const getTeacherById = async (id) => {
  const teacher = await Teacher.findById(id).populate('user', '-password').populate('department');
  if (!teacher) throw new Error('Teacher not found');
  return teacher;
};

const updateTeacher = async (id, data) => {
  const teacher = await Teacher.findByIdAndUpdate(id, data, { new: true });
  if (!teacher) throw new Error('Teacher not found');
  return teacher;
};

const deleteTeacher = async (id) => {
  const teacher = await Teacher.findByIdAndDelete(id);
  if (!teacher) throw new Error('Teacher not found');
  return teacher;
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher
};
