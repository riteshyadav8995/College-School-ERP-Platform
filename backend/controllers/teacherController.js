const teacherService = require('../services/teacherService');

const createTeacher = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    if (!institutionId) return res.status(400).json({ message: 'User does not belong to an institution' });

    const Department = require('../models/Department');
    const dept = await Department.findById(req.body.department);
    const deptShort = dept ? dept.name.substring(0, 2).toUpperCase() : 'GN';

    const Institution = require('../models/Institution');
    const inst = await Institution.findById(institutionId);
    const instShort = inst ? inst.shortForm : 'INST';

    const yy = new Date().getFullYear().toString().slice(-2);
    
    const Teacher = require('../models/Teacher');
    const count = await Teacher.countDocuments({ institution: institutionId });
    const uniqueId = String(count + 1).padStart(3, '0');

    const employeeId = `${yy}${deptShort}${uniqueId}${instShort}`;

    const payload = {
      ...req.body,
      institution: institutionId,
      employeeId
    };

    const teacher = await teacherService.createTeacher(payload);
    res.status(201).json(teacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getTeachers = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const teachers = await teacherService.getTeachers(institutionId);
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const teacher = await teacherService.getTeacherById(req.params.id);
    res.json(teacher);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const role = req.user.role;
    let updateData = {};
    const existingTeacher = await teacherService.getTeacherById(req.params.id);

    if (role === 'teacher' && existingTeacher.user._id.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to edit this profile' });
    }

    if (role === 'teacher') {
      if (req.body.mobile !== undefined) updateData.mobile = req.body.mobile;
      if (req.body.address !== undefined) updateData.address = req.body.address;
      if (req.body.photo !== undefined) updateData.photo = req.body.photo;
    } else if (role === 'hr') {
      if (req.body.salary !== undefined) updateData.salary = req.body.salary;
      if (req.body.experience !== undefined) updateData.experience = req.body.experience;
      if (req.body.qualification !== undefined) updateData.qualification = req.body.qualification;
      if (req.body.joiningDate !== undefined) updateData.joiningDate = req.body.joiningDate;
      if (req.body.pfNumber !== undefined) updateData.pfNumber = req.body.pfNumber;
      if (req.body.bankDetails !== undefined) updateData.bankDetails = req.body.bankDetails;
    } else if (role === 'admin' || role === 'super_admin') {
      updateData = req.body; 
    }

    const teacher = await teacherService.updateTeacher(req.params.id, updateData);

    if (req.body.name || req.body.email || req.body.password) {
       const User = require('../models/User');
       let userUpdate = {};
       if (req.body.name && role !== 'teacher') userUpdate.name = req.body.name;
       if (req.body.email) userUpdate.email = req.body.email; // Teacher can update email
       
       if (req.body.password && role === 'teacher') {
         // Should hash password, but keeping it simple for mock
         userUpdate.password = req.body.password; 
       }
       await User.findByIdAndUpdate(teacher.user._id || teacher.user, userUpdate);
    }

    const updated = await teacherService.getTeacherById(req.params.id);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    await teacherService.deleteTeacher(req.params.id);
    res.json({ message: 'Teacher removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getTeacherProfile = async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: req.user._id }).populate('user', '-password').populate('department');
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  getTeacherProfile
};
