const Setting = require('../models/Setting');

const getSettings = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    let settings = await Setting.findOne({ institution: institutionId });
    
    // If somehow missing, create it
    if (!settings) {
      settings = await Setting.create({ institution: institutionId });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const settings = await Setting.findOneAndUpdate(
      { institution: institutionId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
