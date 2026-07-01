const Payroll = require('../models/Payroll');

const getAll = async (req, res) => {
  try {
    const data = await Payroll.find({ institution: req.user.institution }).populate('employee');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const create = async (req, res) => {
  try {
    const newData = new Payroll({ ...req.body, institution: req.user.institution });
    const savedData = await newData.save();
    res.status(201).json(savedData);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const updated = await Payroll.findOneAndUpdate(
      { _id: req.params.id, institution: req.user.institution },
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await Payroll.findOneAndDelete({ _id: req.params.id, institution: req.user.institution });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getAll, create, update, remove };
