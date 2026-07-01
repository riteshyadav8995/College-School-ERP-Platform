const Assignment = require('../models/Assignment');

const createAssignment = async (data) => {
  return await Assignment.create(data);
};

const getAssignments = async (query) => {
  return await Assignment.find(query).populate('teacher').populate('course');
};

const updateAssignment = async (id, data) => {
  return await Assignment.findByIdAndUpdate(id, data, { new: true });
};

const deleteAssignment = async (id) => {
  return await Assignment.findByIdAndDelete(id);
};

module.exports = { createAssignment, getAssignments, updateAssignment, deleteAssignment };
