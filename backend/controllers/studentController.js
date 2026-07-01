const studentService = require('../services/studentService');
const Student = require('../models/Student');

const createStudent = async (req, res) => {
  try {
    const student = await studentService.createStudent(req.body);
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getStudents = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    let query = {};
    if (institutionId) query.institution = institutionId;
    const students = await studentService.getStudents(query);
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const student = await studentService.getStudentById(req.params.id);
    res.json(student);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const student = await studentService.updateStudent(req.params.id, req.body);
    
    if (req.body.name && student.user) {
      const User = require('../models/User');
      await User.findByIdAndUpdate(student.user._id || student.user, { name: req.body.name });
    }

    const updatedStudent = await studentService.getStudentById(req.params.id);
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    await studentService.deleteStudent(req.params.id);
    res.json({ message: 'Student removed' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user.id }).populate('user', '-password').populate('department').populate('program').populate('hostel').populate('room');
    if (!student) {
      student = await Student.create({
        user: req.user.id,
        studentId: `SID${Date.now().toString().slice(-5)}`,
        rollNumber: `STU${Date.now().toString().slice(-5)}`,
        className: '10',
        section: 'A'
      });
      student = await Student.findById(student._id).populate('user', '-password');
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudentProfile = async (req, res) => {
  try {
    let student = await Student.findOne({ user: req.user.id });
    if (!student) {
      student = await Student.create({
        user: req.user.id,
        studentId: `SID${Date.now().toString().slice(-5)}`,
        rollNumber: `STU${Date.now().toString().slice(-5)}`,
        className: '10',
        section: 'A'
      });
    }

    // Update basic fields
    if (req.body.address) student.address = req.body.address;
    
    if (!student.parentDetails) student.parentDetails = {};
    if (req.body.fatherName) student.parentDetails.fatherName = req.body.fatherName;
    if (req.body.motherName) student.parentDetails.motherName = req.body.motherName;
    if (req.body.contactNumber) student.parentDetails.contactNumber = req.body.contactNumber;

    // Update documents if files were uploaded
    if (!student.documents) student.documents = {};
    if (req.files) {
      if (req.files['marksheet10']) student.documents.marksheet10 = `/uploads/${req.files['marksheet10'][0].filename}`;
      if (req.files['marksheet12']) student.documents.marksheet12 = `/uploads/${req.files['marksheet12'][0].filename}`;
      if (req.files['aadharCard']) student.documents.aadharCard = `/uploads/${req.files['aadharCard'][0].filename}`;
      if (req.files['photo']) student.documents.photo = `/uploads/${req.files['photo'][0].filename}`;
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const selfAssignRoom = async (req, res) => {
  try {
    const Room = require('../models/Room');
    const { roomId } = req.body;
    
    let student = await Student.findOne({ user: req.user.id });
    if (!student) throw new Error('Student profile not found');
    if (student.room) throw new Error('You already have a room assigned');

    const room = await Room.findById(roomId);
    if (!room) throw new Error('Room not found');
    if (room.occupied >= room.capacity) throw new Error('Room is full');
    
    let shareKey = room.shareKey;
    let keyGeneratedAt = room.keyGeneratedAt;
    
    if (room.occupied > 0) {
      if (!room.keyGeneratedAt) {
        // Fallback for older rooms
        throw new Error('This room is not empty. Use a share key to join a partially occupied room.');
      }
      const timeDiff = Date.now() - new Date(room.keyGeneratedAt).getTime();
      if (timeDiff < 5 * 60 * 1000) {
        throw new Error('Room is locked for 5 minutes. Use share key to join.');
      }
      // If 5 mins have passed, let them join. They don't generate a new key if there's one, or we can clear it.
    } else {
      // Generate random string key for empty room
      shareKey = Math.random().toString(36).substring(2, 8).toUpperCase();
      keyGeneratedAt = new Date();
    }
    
    await Room.findByIdAndUpdate(roomId, { $inc: { occupied: 1 }, shareKey, keyGeneratedAt });
    
    student.room = room._id;
    student.hostel = room.hostel;
    await student.save();
    
    res.json({ message: 'Room assigned successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const joinRoomByKey = async (req, res) => {
  try {
    const Room = require('../models/Room');
    const { shareKey } = req.body;
    
    let student = await Student.findOne({ user: req.user.id });
    if (!student) throw new Error('Student profile not found');
    if (student.room) throw new Error('You already have a room assigned');

    const room = await Room.findOne({ shareKey, institution: req.user.institution });
    if (!room) throw new Error('Invalid room key');
    if (room.occupied >= room.capacity) throw new Error('Room is already full');

    await Room.findByIdAndUpdate(room._id, { $inc: { occupied: 1 } });
    
    // if room becomes full, we could clear the shareKey but it's fine to leave it, capacity check will block further joins.
    
    student.room = room._id;
    student.hostel = room.hostel;
    await student.save();
    
    res.json({ message: 'Joined room successfully', student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentProfile,
  updateStudentProfile,
  selfAssignRoom,
  joinRoomByKey
};
