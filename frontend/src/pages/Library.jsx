import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  BookMarked, Plus, Loader2, X, RefreshCw, CheckCircle, AlertTriangle, 
  ScanLine, Download, Upload, Eye, Edit, Trash2, Library as LibraryIcon, BookOpen, Clock 
} from 'lucide-react';

function Library() {
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' or 'issued'
  const [filterMode, setFilterMode] = useState('all'); // 'all' or 'available'
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ bookId: '', title: '', author: '', isbn: '', category: 'General', rack: '', totalCopies: '' });
  const [issueData, setIssueData] = useState({ bookId: '', studentId: '', returnDays: 14 });
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  const { user } = useSelector((state) => state.auth);

  const API_URL = `${import.meta.env.VITE_API_URL}/api/books`;
  const ISSUES_API_URL = `${import.meta.env.VITE_API_URL}/api/book-issues`;
  const STUDENTS_API_URL = `${import.meta.env.VITE_API_URL}/api/students`;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [booksRes, issuesRes] = await Promise.all([
        axios.get(API_URL, config),
        axios.get(ISSUES_API_URL, config).catch(() => ({ data: [] }))
      ]);
      setBooks(booksRes.data);
      setIssues(issuesRes.data);

      if (user.role === 'admin' || user.role === 'super_admin' || user.role === 'librarian') {
        const stdRes = await axios.get(STUDENTS_API_URL, config).catch(() => ({ data: [] }));
        setStudents(stdRes.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleIssueInputChange = (e) => setIssueData({ ...issueData, [e.target.name]: e.target.value });

  const handleAddBook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(API_URL, { ...formData, availableCopies: formData.totalCopies }, config);
      fetchData();
      setIsModalOpen(false);
      setFormData({ bookId: '', title: '', author: '', isbn: '', category: 'General', rack: '', totalCopies: '' });
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(ISSUES_API_URL, issueData, config);
      fetchData();
      setIsIssueModalOpen(false);
      setIssueData({ bookId: '', studentId: '', returnDays: 14 });
      setStudentSearchTerm('');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${ISSUES_API_URL}/${issueId}/return`, {}, config);
      fetchData();
    } catch (error) {
      alert('Error returning book: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const StatCard = ({ title, value, icon: Icon, colorClass, onClick }) => (
    <div 
      onClick={onClick}
      className={`bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-300 transition-all' : ''}`}
    >
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 ${colorClass}`}></div>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
        <div className={`p-2 rounded-lg ${colorClass.replace('bg-', 'bg-opacity-20 text-').replace('500', '600')}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Books" value={books.length} icon={LibraryIcon} colorClass="bg-blue-500" onClick={() => { setActiveTab('catalog'); setFilterMode('all'); }} />
        <StatCard title="Available" value={books.filter(b => b.availableCopies > 0).length} icon={CheckCircle} colorClass="bg-emerald-500" onClick={() => { setActiveTab('catalog'); setFilterMode('available'); }} />
        <StatCard title="Issued" value={issues.filter(i => i.status === 'Issued').length} icon={BookOpen} colorClass="bg-indigo-500" onClick={() => setActiveTab('issued')} />
        <StatCard title="Overdue" value={issues.filter(i => i.status === 'Overdue' || (new Date(i.dueDate) < new Date() && i.status === 'Issued')).length} icon={Clock} colorClass="bg-red-500" onClick={() => setActiveTab('issued')} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header Actions */}
        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-xl">
              <BookMarked className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Library Catalog</h1>
              <p className="text-sm text-slate-500 font-medium">Manage books and track issues</p>
            </div>
          </div>
          
          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'librarian') && (
            <div className="flex flex-wrap items-center gap-3">
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
                <Download className="w-4 h-4" /> Export
              </button>
              <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all shadow-sm">
                <Upload className="w-4 h-4" /> Import CSV
              </button>
              <button 
                onClick={() => setIsIssueModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-indigo-600 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20"
              >
                <ScanLine className="w-4 h-4" /> Issue Book
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl font-medium hover:bg-primary-600 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20"
              >
                <Plus className="w-4 h-4" /> Add Book
              </button>
            </div>
          )}
        </div>

        {/* Tabs - Show for everyone! */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button 
            onClick={() => { setActiveTab('catalog'); setFilterMode('all'); }}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'catalog' && filterMode === 'all' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Book Catalog
          </button>
          <button 
            onClick={() => { setActiveTab('catalog'); setFilterMode('available'); }}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'catalog' && filterMode === 'available' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            Available Books
          </button>
          <button 
            onClick={() => setActiveTab('issued')}
            className={`px-6 py-4 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'issued' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          >
            {user.role === 'student' ? 'My Issued Books' : 'Issued Books'}
          </button>
        </div>

        <div className="p-0">
          {activeTab === 'catalog' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Book ID</th>
                    <th className="p-4 font-semibold">Title</th>
                    <th className="p-4 font-semibold">Author</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Rack</th>
                    <th className="p-4 font-semibold">Available</th>
                    <th className="p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(filterMode === 'available' ? books.filter(b => b.availableCopies > 0) : books).length > 0 ? (
                    (filterMode === 'available' ? books.filter(b => b.availableCopies > 0) : books).map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-slate-600 font-medium">{book.bookId || 'N/A'}</td>
                      <td className="p-4 font-bold text-slate-800">{book.title}</td>
                      <td className="p-4 text-slate-600">{book.author}</td>
                      <td className="p-4 text-slate-600">{book.category || 'General'}</td>
                      <td className="p-4 text-slate-600">{book.rack || 'Not Assigned'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${book.availableCopies > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                          {book.availableCopies} / {book.totalCopies}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                          {(user.role === 'admin' || user.role === 'super_admin' || user.role === 'librarian') && (
                            <>
                              <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                              <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))) : (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-slate-500">No books found in the catalog.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="p-4 font-semibold">Book</th>
                    <th className="p-4 font-semibold">Issued To</th>
                    <th className="p-4 font-semibold">Issue Date</th>
                    <th className="p-4 font-semibold">Due Date</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {issues.length > 0 ? issues.map((issue) => {
                    const isOverdue = new Date(issue.dueDate) < new Date() && issue.status === 'Issued';
                    return (
                      <tr key={issue._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-bold text-slate-800">{issue.book?.title || 'Unknown Book'}</td>
                        <td className="p-4 text-slate-600">{issue.student?.user?.name || 'Unknown Student'}</td>
                        <td className="p-4 text-slate-600">{new Date(issue.issueDate).toLocaleDateString()}</td>
                        <td className={`p-4 font-medium ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
                          {new Date(issue.dueDate).toLocaleDateString()}
                        </td>
                        <td className="p-4">
                          {issue.status === 'Returned' ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 w-max">
                              <CheckCircle className="w-3 h-3" /> Returned
                            </span>
                          ) : isOverdue ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1 w-max">
                              <AlertTriangle className="w-3 h-3" /> Overdue
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                              <Clock className="w-3 h-3" /> Issued
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {issue.status === 'Issued' && (
                            <button 
                              onClick={() => handleReturnBook(issue._id)}
                              className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-700 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              <RefreshCw className="w-4 h-4" /> Return
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No active book issues found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-primary" />
                Add New Book
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Book ID</label>
                  <input type="text" name="bookId" required value={formData.bookId} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. CS-101" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Book Title</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Enter book title" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Author</label>
                  <input type="text" name="author" required value={formData.author} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Enter author name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. Computer Science" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rack No.</label>
                  <input type="text" name="rack" value={formData.rack} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. A1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Copies</label>
                  <input type="number" name="totalCopies" required min="1" value={formData.totalCopies} onChange={handleInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" placeholder="e.g. 10" />
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20 disabled:opacity-70 flex items-center justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Book Modal */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-primary" />
                Issue Book
              </h2>
              <button onClick={() => setIsIssueModalOpen(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Book</label>
                <select name="bookId" required value={issueData.bookId} onChange={handleIssueInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-slate-700">
                  <option value="">-- Choose a book --</option>
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b._id} value={b._id}>{b.bookId ? `${b.bookId} - ` : ''}{b.title} (Available: {b.availableCopies})</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Student</label>
                <input 
                  type="text" 
                  placeholder="Search by name or roll no..." 
                  value={studentSearchTerm}
                  onChange={e => {
                    setStudentSearchTerm(e.target.value);
                    setShowStudentDropdown(true);
                    if (issueData.studentId) setIssueData({...issueData, studentId: ''});
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-slate-700"
                />
                {showStudentDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                    {students.filter(s => 
                      (s.user?.name?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase()) || 
                      (s.rollNumber?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase())
                    ).map(s => (
                      <div 
                        key={s._id} 
                        className="p-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-0"
                        onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                        onClick={() => {
                          setIssueData({...issueData, studentId: s._id});
                          setStudentSearchTerm(`${s.user?.name} (${s.rollNumber})`);
                          setShowStudentDropdown(false);
                        }}
                      >
                        {s.user?.name} ({s.rollNumber})
                      </div>
                    ))}
                    {students.filter(s => 
                      (s.user?.name?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase()) || 
                      (s.rollNumber?.toLowerCase() || '').includes(studentSearchTerm.toLowerCase())
                    ).length === 0 && (
                      <div className="p-2.5 text-sm text-slate-500">No students found</div>
                    )}
                  </div>
                )}
                {/* Hidden input to make HTML5 required work */}
                <input type="hidden" name="studentId" required value={issueData.studentId} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Return Days (Duration)</label>
                <input type="number" name="returnDays" required min="1" value={issueData.returnDays} onChange={handleIssueInputChange} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all" />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsIssueModalOpen(false)} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-1 px-4 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition-all shadow-sm hover:shadow-md hover:shadow-indigo-500/20 disabled:opacity-70 flex items-center justify-center">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Issue Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
