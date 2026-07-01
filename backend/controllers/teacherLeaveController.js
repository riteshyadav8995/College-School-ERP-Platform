const TeacherLeave = require('../models/TeacherLeave');
const Teacher = require('../models/Teacher');

const applyLeave = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    const leave = await TeacherLeave.create({
      ...req.body,
      teacher: teacher._id,
      institution: req.user.institution
    });
    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getLeaves = async (req, res) => {
  try {
    const role = req.user.role;
    let query = {};

    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user.id });
      if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
      query.teacher = teacher._id;
    } else {
      const teachers = await Teacher.find({ institution: req.user.institution });
      const teacherIds = teachers.map(t => t._id);
      
      query.$or = [
        { institution: req.user.institution },
        { teacher: { $in: teacherIds } }
      ];
    }

    const leaves = await TeacherLeave.find(query)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .sort('-appliedAt');
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const processLeave = async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const leave = await TeacherLeave.findByIdAndUpdate(
      req.params.id, 
      { 
        status: req.body.status, 
        processedBy: req.user.id,
        processedAt: Date.now() 
      }, 
      { new: true }
    );
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { applyLeave, getLeaves, processLeave };
