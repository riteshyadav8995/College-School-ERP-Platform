const FacultyCourse = require('../models/FacultyCourse');
const StudentCourse = require('../models/StudentCourse');
const Course = require('../models/Course');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');

// Assign Faculty to Course
exports.assignFaculty = async (req, res) => {
  try {
    const { facultyId, courseId, academicYear, semester } = req.body;
    
    // Check if mapping already exists
    const existing = await FacultyCourse.findOne({ facultyId, courseId, academicYear });
    if (existing) {
      return res.status(400).json({ error: 'Faculty already assigned to this course for the given academic year.' });
    }

    const mapping = new FacultyCourse({
      facultyId,
      courseId,
      academicYear,
      semester,
      institution: req.user.institution
    });

    await mapping.save();
    res.status(201).json({ message: 'Faculty assigned to course successfully', mapping });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Register Student(s) to Course
exports.registerStudent = async (req, res) => {
  try {
    const { studentId, studentIds, courseId, academicYear, semester } = req.body;
    
    // Support both single and multiple student registration
    const idsToRegister = studentIds || (studentId ? [studentId] : []);
    
    if (idsToRegister.length === 0) {
      return res.status(400).json({ error: 'No students provided.' });
    }

    const successfulMappings = [];
    let alreadyRegisteredCount = 0;

    for (const id of idsToRegister) {
      const existing = await StudentCourse.findOne({ studentId: id, courseId, academicYear });
      if (existing) {
        alreadyRegisteredCount++;
        continue;
      }

      const mapping = new StudentCourse({
        studentId: id,
        courseId,
        academicYear,
        semester,
        institution: req.user.institution
      });

      await mapping.save();
      successfulMappings.push(mapping);
    }
    
    if (successfulMappings.length === 0 && alreadyRegisteredCount > 0) {
        return res.status(400).json({ error: 'All selected students are already registered.' });
    }

    res.status(201).json({ 
        message: `Successfully registered ${successfulMappings.length} student(s). ${alreadyRegisteredCount > 0 ? `(${alreadyRegisteredCount} were already registered)` : ''}`, 
        mappings: successfulMappings 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get Students for a Course
exports.getCourseStudents = async (req, res) => {
  try {
    const { courseId } = req.params;
    const mappings = await StudentCourse.find({ courseId, institution: req.user.institution })
      .populate({ path: 'studentId', populate: { path: 'user', select: 'name email' } })
      .sort('-createdAt');

    res.json(mappings.map(m => m.studentId));
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get Courses for Logged-in Faculty
exports.getMyCourses = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) return res.status(404).json({ error: 'Teacher profile not found' });

    const mappings = await FacultyCourse.find({ facultyId: teacher._id })
      .populate('courseId')
      .sort('-createdAt');

    res.json(mappings.map(m => m.courseId));
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Student Self Enrollment
exports.enrollStudent = async (req, res) => {
  try {
    const { courseId, academicYear } = req.body;
    
    const Student = require('../models/Student');
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const Course = require('../models/Course');
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Determine semester from the course's semesterId reference
    const Semester = require('../models/Semester');
    let semesterNumber = 1;
    if (course.semesterId) {
      const sem = await Semester.findById(course.semesterId);
      if (sem) semesterNumber = sem.semesterNumber;
    }

    const existing = await StudentCourse.findOne({ studentId: student._id, courseId, academicYear });
    if (existing) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    const mapping = new StudentCourse({
      studentId: student._id,
      courseId,
      academicYear: academicYear || course.academicYear || '2026-27',
      semester: semesterNumber,
      institution: req.user.institution
    });

    await mapping.save();
    res.status(201).json({ message: 'Successfully enrolled in course', mapping });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
};

// Get Enrolled Courses for Logged-in Student
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) return res.status(404).json({ error: 'Student profile not found' });

    const mappings = await StudentCourse.find({ studentId: student._id })
      .populate({
        path: 'courseId',
        populate: {
          path: 'teacherId',
          populate: { path: 'user' }
        }
      })
      .sort('-createdAt');

    // Only return mapped courses
    const validCourses = mappings.map(m => m.courseId).filter(c => c !== null);
    res.json(validCourses);
  } catch (error) {
    console.error('[getMyEnrolledCourses] Error:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};
