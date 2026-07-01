const Mark = require('../models/Mark');

const createMark = async (data) => {
  const mark = new Mark(data);
  return await mark.save();
};

const getMarks = async (filter = {}) => {
  return await Mark.find(filter).populate({
    path: 'student',
    populate: { path: 'user', select: 'name email' }
  });
};

const deleteMark = async (id) => {
  const mark = await Mark.findById(id);
  if (!mark) throw new Error('Mark record not found');
  await mark.deleteOne();
};

module.exports = { createMark, getMarks, deleteMark };
