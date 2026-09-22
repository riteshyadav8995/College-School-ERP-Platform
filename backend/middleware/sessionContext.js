const { AsyncLocalStorage } = require('async_hooks');

// Holds the academic session (year + semester) picked in the frontend header
// for the lifetime of a request, so models can scope their queries to it.
const sessionStore = new AsyncLocalStorage();

const readHeader = (req, name) => {
  const value = req.headers[name];
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed && trimmed.length <= 50 ? trimmed : null;
};

const sessionContext = (req, res, next) => {
  const academicYear = readHeader(req, 'x-academic-year');
  const semester = readHeader(req, 'x-semester');
  const session = academicYear && semester ? { academicYear, semester } : null;
  sessionStore.run({ session }, next);
};

const getCurrentSession = () => sessionStore.getStore()?.session || null;

module.exports = { sessionContext, getCurrentSession };
