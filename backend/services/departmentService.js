const Department = require('../models/Department');

const createDepartment = async (data) => {
  const deptExists = await Department.findOne({ name: data.name });
  if (deptExists) throw new Error('Department already exists');
  return await Department.create(data);
};

const getDepartments = async (institutionId) => {
  return await Department.find({ institution: institutionId }).populate('headOfDepartment');
};

const getDepartmentById = async (id, institutionId) => {
  const department = await Department.findOne({ _id: id, institution: institutionId }).populate('headOfDepartment');
  if (!department) throw new Error('Department not found');
  return department;
};

const updateDepartment = async (id, institutionId, data) => {
  const { name, description } = data;
  const department = await Department.findOneAndUpdate(
    { _id: id, institution: institutionId },
    { name, description },
    { returnDocument: 'after', runValidators: true }
  );
  if (!department) throw new Error('Department not found');
  return department;
};

const deleteDepartment = async (id, institutionId) => {
  const department = await Department.findOneAndDelete({ _id: id, institution: institutionId });
  if (!department) throw new Error('Department not found');
  return department;
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
