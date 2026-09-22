const Setting = require('../models/Setting');

// Older settings documents only have the current values, so make sure
// the option lists always contain them.
const withOptions = (settings) => {
  const obj = settings.toObject();
  const academicYears = obj.academicYears?.length ? [...obj.academicYears] : [];
  const semesters = obj.semesters?.length ? [...obj.semesters] : [];
  if (obj.academicYear && !academicYears.includes(obj.academicYear)) academicYears.unshift(obj.academicYear);
  if (obj.semester && !semesters.includes(obj.semester)) semesters.unshift(obj.semester);
  return { ...obj, academicYears, semesters };
};

const cleanList = (list) => {
  if (!Array.isArray(list)) return null;
  const cleaned = [...new Set(list.map((v) => String(v).trim()).filter(Boolean))];
  return cleaned.length ? cleaned : null;
};

const getSettings = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    let settings = await Setting.findOne({ institution: institutionId });
    
    // If somehow missing, create it
    if (!settings) {
      settings = await Setting.create({ institution: institutionId });
    }
    res.json(withOptions(settings));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const institutionId = req.user.institution;
    const academicYears = cleanList(req.body.academicYears);
    const semesters = cleanList(req.body.semesters);
    if (!academicYears || !semesters) {
      return res.status(400).json({ message: 'At least one academic year and one semester are required' });
    }

    const academicYear = academicYears.includes(req.body.academicYear) ? req.body.academicYear : academicYears[0];
    const semester = semesters.includes(req.body.semester) ? req.body.semester : semesters[0];

    const settings = await Setting.findOneAndUpdate(
      { institution: institutionId },
      { academicYears, semesters, academicYear, semester },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    res.json(withOptions(settings));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
