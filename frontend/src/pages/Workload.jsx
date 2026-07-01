import { Calendar } from 'lucide-react';

function Workload() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-indigo-100 p-2.5 rounded-xl">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Faculty Workload</h1>
            <p className="text-sm text-slate-500">Manage faculty schedules and class assignments.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
        <p className="text-lg font-medium">Workload Management Module coming soon!</p>
      </div>
    </div>
  );
}

export default Workload;
