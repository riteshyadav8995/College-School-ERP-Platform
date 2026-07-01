const Groq = require('groq-sdk');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Fee = require('../models/Fee');
const BookIssue = require('../models/BookIssue');
const Institution = require('../models/Institution');
const mongoose = require('mongoose');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_groq_key'
});

const generateResponse = async (prompt, user) => {
  try {
    let contextStr = "";

    if (user.role === 'student') {
      const studentProfile = await Student.findOne({ user: user.id }).populate('program');
      if (studentProfile) {
        // Attendance Context
        const stats = await Attendance.aggregate([
          { $match: { studentId: studentProfile._id } },
          { $group: { 
              _id: "$courseId", 
              totalClasses: { $sum: 1 }, 
              present: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } } 
            } 
          },
          { $lookup: { from: 'courses', localField: '_id', foreignField: '_id', as: 'course' } },
          { $unwind: "$course" }
        ]);
        
        let attSummary = stats.map(s => `${s.course.courseName}: ${s.present}/${s.totalClasses} classes (${Math.round((s.present / s.totalClasses) * 100)}%)`).join(', ');
        
        // Fee Context
        const fees = await Fee.find({ student: studentProfile._id });
        const pendingFees = fees.filter(f => f.status !== 'Paid').reduce((acc, f) => acc + f.amount, 0);

        // Books Context
        const books = await BookIssue.find({ student: studentProfile._id, status: 'Issued' }).populate('book');
        let bookSummary = books.map(b => `${b.book?.title} (Due: ${new Date(b.dueDate).toLocaleDateString()})`).join(', ');

        contextStr = `Your Profile: Roll Number ${studentProfile.rollNumber}, Class ${studentProfile.className}, Section ${studentProfile.section}.
Your Attendance Track: ${attSummary || 'No attendance records found.'}
Your Pending Fees: ₹${pendingFees}.
Your Issued Library Books: ${bookSummary || 'None.'}
`;
      }
    } else if (user.role === 'teacher') {
      const teacherProfile = await Teacher.findOne({ user: user.id });
      if (teacherProfile) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const todayClasses = await Timetable.find({ teacher: teacherProfile._id, dayOfWeek: today }).sort('startTime');
        let classSummary = todayClasses.map(c => `${c.subject} at ${c.startTime}`).join(', ');

        contextStr = `Your Profile: Teacher ID ${teacherProfile.teacherId}, Department ${teacherProfile.department}.
Your Classes Today: ${classSummary || 'No classes scheduled for today.'}
`;
      }
    } else {
      const studentCount = await Student.countDocuments();
      const teacherCount = await Teacher.countDocuments();
      const deptCount = await Department.countDocuments();
      contextStr = `Current System Stats: ${studentCount} Students, ${teacherCount} Teachers, ${deptCount} Departments.`;
    }

    const systemPrompt = `You are an intelligent, friendly AI Assistant named ERP-Bot built for a School & College ERP system. 
You are talking to a user whose role is: ${user.role} and name is: ${user.name || 'User'}.
${contextStr}
Please answer the user's questions clearly, concisely, and helpfully. Keep responses relatively short.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      model: "llama-3.1-8b-instant", 
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    if (error.status === 401 || error.message?.includes('API key') || error.message?.includes('401')) {
      return "It looks like the Groq API Key hasn't been configured correctly or is invalid! Please update the `.env` file in the backend with your real `GROQ_API_KEY`.";
    }
    throw error;
  }
};

module.exports = { generateResponse };
