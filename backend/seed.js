const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB for seeding...');

    const SubscriptionPlan = require('./models/SubscriptionPlan');
    const Institution = require('./models/Institution');
    const User = require('./models/User');
    const Department = require('./models/Department');
    const Teacher = require('./models/Teacher');
    const Student = require('./models/Student');
    const Setting = require('./models/Setting');
    const Billing = require('./models/Billing');

    // 1. Create a Subscription Plan
    const plan = await SubscriptionPlan.create({
      name: 'Enterprise',
      price: 50000,
      maxStudents: 5000,
      maxTeachers: 500,
      storageLimit: 100,
      aiFeatures: true
    });
    console.log('Created Enterprise Plan');

    // 2. Create an Institution
    const institution = await Institution.create({
      name: 'Indian Institute of Technology Patna',
      shortForm: 'IITP',
      institutionType: 'University',
      state: 'Bihar',
      country: 'India',
      subscriptionPlan: plan._id,
      status: 'Active'
    });
    console.log('Created Institution: IITP');

    // Create Initial Billing Record
    await Billing.create({
      institution: institution._id,
      plan: plan._id,
      amount: plan.price,
      invoiceNumber: `INV-${Date.now()}`
    });

    // Create Setting
    await Setting.create({
      institution: institution._id,
      academicYear: '2026-27',
      semester: 'Monsoon'
    });

    // 3. Create College Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await User.create({
      name: 'IITP Admin',
      email: 'admin@iitp.ac.in',
      password: hashedPassword,
      role: 'admin',
      institution: institution._id
    });
    console.log('Created Admin: admin@iitp.ac.in / password123');

    // 4. Create Departments
    const deptCSE = await Department.create({
      institution: institution._id,
      name: 'Computer Science and Engineering',
      code: 'CSE'
    });
    const deptME = await Department.create({
      institution: institution._id,
      name: 'Mechanical Engineering',
      code: 'ME'
    });
    console.log('Created Departments');

    // 5. Create Teachers
    const teacher1User = await User.create({
      name: 'Rajesh Kumar', email: 'rajesh@iitp.ac.in', password: hashedPassword, role: 'teacher', institution: institution._id
    });
    const teacher1 = await Teacher.create({
      user: teacher1User._id,
      institution: institution._id,
      department: deptCSE._id,
      employeeId: 'EMP001'
    });
    
    const teacher2User = await User.create({
      name: 'Anita Sharma', email: 'anita@iitp.ac.in', password: hashedPassword, role: 'teacher', institution: institution._id
    });
    const teacher2 = await Teacher.create({
      user: teacher2User._id,
      institution: institution._id,
      department: deptME._id,
      employeeId: 'EMP002'
    });
    console.log('Created Teachers');

    // 6. Create Students
    const student1User = await User.create({
      name: 'Rahul Verma', email: 'rahul.v@iitp.ac.in', password: hashedPassword, role: 'student', institution: institution._id
    });
    await Student.create({
      user: student1User._id,
      institution: institution._id,
      department: deptCSE._id,
      studentId: '2023CS01',
      rollNumber: '2301'
    });

    const student2User = await User.create({
      name: 'Priya Singh', email: 'priya.s@iitp.ac.in', password: hashedPassword, role: 'student', institution: institution._id
    });
    await Student.create({
      user: student2User._id,
      institution: institution._id,
      department: deptME._id,
      studentId: '2023ME01',
      rollNumber: '2302'
    });
    console.log('Created Students');

    console.log('Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();

