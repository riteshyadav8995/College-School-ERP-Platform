const Hostel = require('../models/Hostel');
const Room = require('../models/Room');

// Hostel Controllers
const getAllHostels = async (req, res) => {
  try {
    const data = await Hostel.find({ institution: req.user.institution }).populate('program');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHostelsByProgram = async (req, res) => {
  try {
    let query = { institution: req.user.institution, program: req.params.programId };
    
    // If the requester is a student, filter hostels by their gender
    if (req.user.role === 'student') {
      const Student = require('../models/Student');
      const student = await Student.findOne({ user: req.user.id });
      if (student && student.gender) {
        if (student.gender === 'Male') query.type = 'Boys';
        else if (student.gender === 'Female') query.type = 'Girls';
        // If 'Other', they might need special handling, but we can default to showing everything or letting admin assign manually. For now, we strict match if male/female.
      }
    }

    const data = await Hostel.find(query);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createHostel = async (req, res) => {
  try {
    const newData = new Hostel({ ...req.body, institution: req.user.institution });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateHostel = async (req, res) => {
  try {
    const updated = await Hostel.findOneAndUpdate(
      { _id: req.params.id, institution: req.user.institution },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteHostel = async (req, res) => {
  try {
    await Hostel.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    await Room.deleteMany({ hostel: req.params.id, institution: req.user.institution });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Room Controllers
const getRoomsByHostel = async (req, res) => {
  try {
    const rooms = await Room.find({ hostel: req.params.hostelId, institution: req.user.institution });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAvailableRoomsByHostel = async (req, res) => {
  try {
    const rooms = await Room.find({
      hostel: req.params.hostelId,
      institution: req.user.institution
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createRoom = async (req, res) => {
  try {
    const newRoom = new Room({ ...req.body, hostel: req.params.hostelId, institution: req.user.institution, occupied: 0 });
    const savedRoom = await newRoom.save();
    res.status(201).json(savedRoom);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const bulkCreateRooms = async (req, res) => {
  try {
    const { floor, startRoom, endRoom, capacity } = req.body;
    const start = parseInt(startRoom);
    const end = parseInt(endRoom);
    if (isNaN(start) || isNaN(end) || start > end) throw new Error("Invalid room range");

    const roomsToInsert = [];
    for (let i = start; i <= end; i++) {
      roomsToInsert.push({
        hostel: req.params.hostelId,
        institution: req.user.institution,
        roomNumber: String(i),
        floor: String(floor),
        capacity: parseInt(capacity),
        occupied: 0
      });
    }

    const savedRooms = await Room.insertMany(roomsToInsert);
    res.status(201).json({ message: `Successfully created ${savedRooms.length} rooms.`, rooms: savedRooms });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateRoom = async (req, res) => {
  try {
    const updated = await Room.findOneAndUpdate(
      { _id: req.params.id, institution: req.user.institution },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteRoom = async (req, res) => {
  try {
    await Room.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { 
  getAllHostels, getHostelsByProgram, createHostel, updateHostel, deleteHostel,
  getRoomsByHostel, getAvailableRoomsByHostel, createRoom, bulkCreateRooms, updateRoom, deleteRoom 
};
