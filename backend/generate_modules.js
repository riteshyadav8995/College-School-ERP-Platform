const fs = require('fs');
const path = require('path');

const modules = [
  { name: 'Program', fields: "departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, name: String, durationYears: Number, totalSemesters: Number" },
  { name: 'Semester', fields: "programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program' }, semesterNumber: Number" },
  { name: 'Course', fields: "semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' }, courseCode: String, courseName: String, credits: Number, teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }" }
];

modules.forEach(m => {
  // 1. Generate Model
  const modelContent = `const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  ${m.fields},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('${m.name}', schema);
`;
  fs.writeFileSync(path.join(__dirname, 'models', `${m.name}.js`), modelContent);

  // 2. Generate Controller
  const controllerContent = `const ${m.name} = require('../models/${m.name}');

const getAll = async (req, res) => {
  try {
    const data = await ${m.name}.find({ institution: req.user.institution });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newData = new ${m.name}({ ...req.body, institution: req.user.institution });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await ${m.name}.findOneAndUpdate(
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
    await ${m.name}.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAll, create, update, remove };
`;
  fs.writeFileSync(path.join(__dirname, 'controllers', `${m.name.toLowerCase()}Controller.js`), controllerContent);

  // 3. Generate Routes
  const routeContent = `const express = require('express');
const router = express.Router();
const { getAll, create, update, remove } = require('../controllers/${m.name.toLowerCase()}Controller');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'super_admin'));

router.route('/').get(getAll).post(create);
router.route('/:id').put(update).delete(remove);

module.exports = router;
`;
  fs.writeFileSync(path.join(__dirname, 'routes', `${m.name.toLowerCase()}Routes.js`), routeContent);
});

console.log("Modules generated successfully!");
