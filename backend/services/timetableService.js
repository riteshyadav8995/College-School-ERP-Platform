const Timetable = require('../models/Timetable');

const checkOverlap = async (data, excludeId = null) => {
  // Convert time string "HH:MM AM/PM" or "HH:MM" (assuming 24hr or time input format) to minutes
  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const newStart = toMinutes(data.startTime);
  const newEnd = toMinutes(data.endTime);

  const query = {
    institution: data.institution,
    dayOfWeek: data.dayOfWeek
  };
  if (excludeId) query._id = { $ne: excludeId };

  const existingEntries = await Timetable.find(query);

  for (const entry of existingEntries) {
    const existingStart = toMinutes(entry.startTime);
    const existingEnd = toMinutes(entry.endTime);

    // Overlap condition: (StartA < EndB) and (EndA > StartB)
    if (newStart < existingEnd && newEnd > existingStart) {
      if (entry.room && data.room && entry.room === data.room) {
        throw new Error(`Room ${data.room} is already occupied during this time.`);
      }
      if (entry.teacher.toString() === data.teacher.toString()) {
        throw new Error('Teacher is already scheduled for another class during this time.');
      }
    }
  }
};

const createTimetable = async (data) => {
  await checkOverlap(data);
  return await Timetable.create(data);
};

const getTimetable = async (query) => {
  return await Timetable.find(query).populate('teacher');
};

const updateTimetable = async (id, data) => {
  const existing = await Timetable.findById(id);
  if (!existing) throw new Error('Timetable entry not found');
  
  const mergedData = { ...existing.toObject(), ...data };
  await checkOverlap(mergedData, id);
  
  return await Timetable.findByIdAndUpdate(id, data, { new: true });
};

const deleteTimetable = async (id) => {
  return await Timetable.findByIdAndDelete(id);
};

module.exports = { createTimetable, getTimetable, updateTimetable, deleteTimetable };
