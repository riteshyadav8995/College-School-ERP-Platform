import { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings2, Plus, Trash2, X, Loader2 } from 'lucide-react';

// Academic year / semester picker shown in the dashboard header.
// Everyone picks from the institution's list; admins can also edit the list.
function SessionSelector({ user, session, onChange }) {
  const [settings, setSettings] = useState(null);
  const [showManage, setShowManage] = useState(false);

  const isAdmin = user.role === 'admin';
  const config = { headers: { Authorization: `Bearer ${user.token}` } };
  const API_URL = `${import.meta.env.VITE_API_URL}/api/settings`;

  useEffect(() => {
    axios.get(API_URL, config)
      .then((res) => setSettings(res.data))
      .catch((error) => console.error('Error fetching settings:', error));
  }, []);

  const academicYears = settings?.academicYears || [session.academicYear];
  const semesters = settings?.semesters || [session.semester];

  // Fall back to the institution default when the saved choice no longer exists
  const academicYear = academicYears.includes(session.academicYear) ? session.academicYear : (settings?.academicYear || academicYears[0]);
  const semester = semesters.includes(session.semester) ? session.semester : (settings?.semester || semesters[0]);

  useEffect(() => {
    if (settings && (academicYear !== session.academicYear || semester !== session.semester)) {
      onChange({ academicYear, semester });
    }
  }, [settings, academicYear, semester]);

  const choose = (field, value) => onChange({ academicYear, semester, [field]: value });

  const selectClass = 'px-2 py-1 text-xs font-bold rounded-md border outline-none cursor-pointer focus:ring-2 focus:ring-primary/20';

  return (
    <div className="hidden lg:flex items-center gap-3 mr-4">
      <label className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
        AY:
        <select value={academicYear} onChange={(e) => choose('academicYear', e.target.value)} className={`${selectClass} bg-blue-50 border-transparent text-blue-700`}>
          {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>
      <label className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100">
        <select value={semester} onChange={(e) => choose('semester', e.target.value)} className={`${selectClass} bg-indigo-50 border-transparent text-indigo-700`}>
          {semesters.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        Sem
      </label>
      {isAdmin && (
        <button
          type="button"
          onClick={() => setShowManage(true)}
          title="Manage academic years and semesters"
          className="p-1.5 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </button>
      )}

      {showManage && (
        <ManageSessionsModal
          settings={settings || { academicYears, semesters, academicYear, semester }}
          onClose={() => setShowManage(false)}
          onSave={async (data) => {
            const res = await axios.put(API_URL, data, config);
            setSettings(res.data);
            setShowManage(false);
          }}
        />
      )}
    </div>
  );
}

function OptionList({ title, items, setItems, defaultValue, setDefault, placeholder }) {
  const [newItem, setNewItem] = useState('');

  const add = () => {
    const value = newItem.trim();
    if (!value || items.includes(value)) return;
    setItems([...items, value]);
    setNewItem('');
  };

  const rename = (index, value) => {
    const old = items[index];
    setItems(items.map((item, i) => (i === index ? value : item)));
    if (defaultValue === old) setDefault(value);
  };

  const remove = (index) => {
    const removed = items[index];
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    if (defaultValue === removed) setDefault(next[0] || '');
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-2">{title}</h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="radio"
              name={title}
              checked={defaultValue === item}
              onChange={() => setDefault(item)}
              title="Set as default"
              className="accent-primary"
            />
            <input
              type="text"
              value={item}
              onChange={(e) => rename(i, e.target.value)}
              className="flex-1 px-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={items.length === 1}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={newItem}
          placeholder={placeholder}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
        <button type="button" onClick={add} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
    </div>
  );
}

function ManageSessionsModal({ settings, onClose, onSave }) {
  const [academicYears, setAcademicYears] = useState(settings.academicYears);
  const [semesters, setSemesters] = useState(settings.semesters);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [semester, setSemester] = useState(settings.semester);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const years = academicYears.map((y) => y.trim()).filter(Boolean);
    const sems = semesters.map((s) => s.trim()).filter(Boolean);
    if (!years.length || !sems.length) {
      setError('Keep at least one academic year and one semester.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ academicYears: years, semesters: sems, academicYear: academicYear.trim(), semester: semester.trim() });
    } catch (err) {
      console.error(err);
      setError('Could not save. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Academic Sessions</h3>
            <p className="text-xs text-slate-500">Add or edit the options everyone can pick. The selected radio is the default.</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-6 overflow-y-auto">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <OptionList title="Academic Years" items={academicYears} setItems={setAcademicYears} defaultValue={academicYear} setDefault={setAcademicYear} placeholder="e.g. 2027-28" />
          <OptionList title="Semesters" items={semesters} setItems={setSemesters} defaultValue={semester} setDefault={setSemester} placeholder="e.g. Summer" />
        </div>
        <div className="p-5 border-t border-slate-200 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300">Cancel</button>
          <button type="button" onClick={handleSave} disabled={saving} className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 flex items-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionSelector;
