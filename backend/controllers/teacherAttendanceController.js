const TeacherAttendance = require('../models/TeacherAttendance');
const Teacher = require('../models/Teacher');

const markAttendance = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ message: 'Teacher profile not found' });

    // Ensure they only mark once per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let attendance = await TeacherAttendance.findOne({
      teacher: teacher._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (attendance) {
       // Update check out
       attendance.checkOut = new Date();
       await attendance.save();
    } else {
       // Create new check in
       attendance = await TeacherAttendance.create({
         teacher: teacher._id,
         date: new Date(),
         checkIn: new Date(),
         status: 'Present',
         markedBy: req.user.id
       });
    }

    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { markAttendance };
