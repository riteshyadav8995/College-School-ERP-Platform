// One-time backfill: tags records created before session scoping with their
// institution's default academic year and semester, so they stay visible.
// Safe to re-run; only records without a session tag are touched.
require('dotenv').config();
const mongoose = require('mongoose');
const Setting = require('../models/Setting');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const WITH_INSTITUTION = ['Attendance', 'Timetable', 'Assignment', 'Scholarship', 'Placement', 'TeacherLeave', 'Payroll', 'StudentCourse', 'FacultyCourse'];
const VIA_STUDENT = { Mark: 'student', Fee: 'student' };
const VIA_TEACHER = { TeacherAttendance: 'teacher' };
const FALLBACK = { academicYear: '2026-27', semester: 'Monsoon' };

const untagged = { sessionYear: { $exists: false } };
const tag = (s) => ({ $set: { sessionYear: s.academicYear, sessionSemester: s.semester } });

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const settings = await Setting.find().lean();

  for (const s of settings) {
    const inst = s.institution;
    const studentIds = (await Student.find({ institution: inst }).select('_id').lean()).map((d) => d._id);
    const teacherIds = (await Teacher.find({ institution: inst }).select('_id').lean()).map((d) => d._id);

    for (const name of WITH_INSTITUTION) {
      const res = await require(`../models/${name}`).updateMany({ ...untagged, institution: inst }, tag(s));
      if (res.modifiedCount) console.log(`${name}: ${res.modifiedCount} tagged ${s.academicYear} ${s.semester}`);
    }
    for (const [name, field] of Object.entries(VIA_STUDENT)) {
      const res = await require(`../models/${name}`).updateMany({ ...untagged, [field]: { $in: studentIds } }, tag(s));
      if (res.modifiedCount) console.log(`${name}: ${res.modifiedCount} tagged ${s.academicYear} ${s.semester}`);
    }
    for (const [name, field] of Object.entries(VIA_TEACHER)) {
      const res = await require(`../models/${name}`).updateMany({ ...untagged, [field]: { $in: teacherIds } }, tag(s));
      if (res.modifiedCount) console.log(`${name}: ${res.modifiedCount} tagged ${s.academicYear} ${s.semester}`);
    }
  }

  // Anything left over could not be linked to an institution
  for (const name of [...WITH_INSTITUTION, ...Object.keys(VIA_STUDENT), ...Object.keys(VIA_TEACHER)]) {
    const res = await require(`../models/${name}`).updateMany(untagged, tag(FALLBACK));
    if (res.modifiedCount) console.log(`${name}: ${res.modifiedCount} tagged with fallback ${FALLBACK.academicYear} ${FALLBACK.semester}`);
  }

  console.log('Done');
  process.exit(0);
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
