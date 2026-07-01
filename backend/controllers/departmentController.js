const departmentService = require('../services/departmentService');

const createDepartment = async (req, res) => {
  try {
    const data = { ...req.body, institution: req.user.institution };
    const department = await departmentService.createDepartment(data);
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await departmentService.getDepartments(req.user.institution);
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDepartmentById = async (req, res) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id, req.user.institution);
    res.json(department);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.user.institution, req.body);
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    await departmentService.deleteDepartment(req.params.id, req.user.institution);
    res.json({ message: 'Department removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
