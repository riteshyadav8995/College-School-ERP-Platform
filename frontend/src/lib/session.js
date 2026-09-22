// The academic session (year + semester) picked in the dashboard header.
// It is sent with every API request so the backend returns that session's data.
let currentSession = null;

const storageKey = (user) => `session:${user._id}`;

export const loadSession = (user) => {
  let saved = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey(user))) || {};
  } catch {
    // Storage unavailable; use the institution default
  }
  return {
    academicYear: saved.academicYear || user.settings?.academicYear || '2026-27',
    semester: saved.semester || user.settings?.semester || 'Monsoon',
  };
};

export const saveSession = (user, session) => {
  try {
    localStorage.setItem(storageKey(user), JSON.stringify(session));
  } catch {
    // Storage unavailable; the choice just won't be remembered
  }
};

export const setCurrentSession = (session) => {
  currentSession = session;
};

export const getCurrentSession = () => currentSession;
