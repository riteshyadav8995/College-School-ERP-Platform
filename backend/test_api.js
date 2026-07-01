
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');
const Program = require('./models/Program');
const Hostel = require('./models/Hostel');
const Student = require('./models/Student');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const studentProfile = await Student.findOne().sort({createdAt: -1}).populate('user program');
  const user = studentProfile.user;
  
  const token = require('jsonwebtoken').sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '30d' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/students/profile', { headers: { Authorization: 'Bearer ' + token } });
    console.log('Program _id from profile:', res.data.program?._id);
    
    if (res.data.program?._id) {
      const hostelsRes = await axios.get('http://localhost:5000/api/hostel/program/' + res.data.program._id, { headers: { Authorization: 'Bearer ' + token } });
      console.log('Hostels returned:', hostelsRes.data);
    }
  } catch(e) { console.log(e.response ? e.response.data : e.message); }
  
  process.exit(0);
});

