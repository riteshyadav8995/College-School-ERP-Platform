const { getCurrentSession } = require('../middleware/sessionContext');

// Tags records with the academic session they belong to and limits reads and
// writes to the session selected for the current request. Requests without a
// session (scripts, webhooks, super admin) are not filtered.
const QUERY_HOOKS = [
  'find', 'findOne', 'countDocuments', 'distinct',
  'findOneAndUpdate', 'findOneAndDelete', 'findOneAndReplace',
  'updateOne', 'updateMany', 'replaceOne', 'deleteOne', 'deleteMany',
];

function sessionScope(schema) {
  schema.add({
    sessionYear: { type: String, index: true },
    sessionSemester: { type: String, index: true },
  });

  schema.pre('validate', function () {
    const session = getCurrentSession();
    if (!session) return;
    if (!this.sessionYear) this.sessionYear = session.academicYear;
    if (!this.sessionSemester) this.sessionSemester = session.semester;
  });

  schema.pre('insertMany', function (next, docs) {
    const session = getCurrentSession();
    const list = Array.isArray(docs) ? docs : (Array.isArray(next) ? next : []);
    if (session) {
      list.forEach((doc) => {
        if (!doc.sessionYear) doc.sessionYear = session.academicYear;
        if (!doc.sessionSemester) doc.sessionSemester = session.semester;
      });
    }
    if (typeof next === 'function') next();
  });

  schema.pre(QUERY_HOOKS, function () {
    const session = getCurrentSession();
    if (!session || this.getOptions().skipSession) return;
    const filter = this.getFilter();
    if (filter.sessionYear === undefined) filter.sessionYear = session.academicYear;
    if (filter.sessionSemester === undefined) filter.sessionSemester = session.semester;
    this.setQuery(filter);
  });

  schema.pre('aggregate', function () {
    const session = getCurrentSession();
    if (!session || this.options?.skipSession) return;
    this.pipeline().unshift({ $match: { sessionYear: session.academicYear, sessionSemester: session.semester } });
  });
}

module.exports = sessionScope;
