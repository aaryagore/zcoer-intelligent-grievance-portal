import React from 'react';
import { 
  Search, Filter, Calendar, Tag, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, User, EyeOff, X
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Complaint, Category } from '../types';
import { CATEGORIES, STATUS_COLORS } from '../constants';

export const ComplaintList: React.FC = () => {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterCategory, setFilterCategory] = React.useState<Category | 'All'>('All');
  const [selectedComplaint, setSelectedComplaint] = React.useState<Complaint | null>(null);
  
  const currentStudent = storage.getCurrentStudent();
  const currentUserId = currentStudent?.zprn?.toLowerCase();

  React.useEffect(() => {
    storage.getComplaints().then(setComplaints);
  }, []);

  const filteredComplaints = complaints.filter(c => {
    const isOwnComplaint = currentUserId
      ? c.studentId?.toLowerCase() === currentUserId
      : true;
    const matchesSearch =
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || c.category === filterCategory;
    return isOwnComplaint && matchesSearch && matchesCategory;
  });

  const getPriorityColor = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Low': return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: Complaint['status']) => {
    switch (status) {
      case 'Pending': return <Clock className="w-3.5 h-3.5" />;
      case 'In Progress': return <AlertTriangle className="w-3.5 h-3.5" />;
      case 'Resolved': return <CheckCircle2 className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <span className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-2 block">Complaint Registry</span>
          <h1 className="text-3xl font-black text-slate-900">Your Grievance Tracker</h1>
          <p className="text-slate-600 mt-1">ML-prioritized complaint history with real-time status.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search ID or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as any)}
              className="w-full sm:w-48 appearance-none bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {!currentStudent && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-amber-800 font-medium text-sm">Login to see your complaints. Showing all public complaints.</p>
        </div>
      )}

      {filteredComplaints.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-20 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Tag className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No complaints found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {currentStudent ? 'You have not submitted any complaints yet.' : 'Try adjusting your filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredComplaints.map((complaint) => (
            <div
              key={complaint.id}
              onClick={() => setSelectedComplaint(complaint)}
              className={`group bg-white rounded-2xl border p-6 hover:shadow-md transition-all cursor-pointer relative overflow-hidden ${
                complaint.priority === 'Critical' ? 'border-rose-200 hover:border-rose-300' : 'border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-grow">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      #{complaint.id}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(complaint.createdAt).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {complaint.subject}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {complaint.category}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[complaint.status]}`}>
                      <span className="mr-1.5">{getStatusIcon(complaint.status)}</span>
                      {complaint.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(complaint.priority)}`}>
                      {complaint.priority} Priority
                    </span>
                  </div>
                </div>

                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                  <div className="flex items-center space-x-2 text-sm">
                    {complaint.isAnonymous ? (
                      <div className="flex items-center text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                        <EyeOff className="w-3.5 h-3.5 mr-1.5" />
                        <span>Anonymous</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        <User className="w-3.5 h-3.5 mr-1.5" />
                        <span>{complaint.studentName}</span>
                      </div>
                    )}
                  </div>
                  <div className="md:mt-3 text-indigo-600 font-bold text-sm flex items-center hover:translate-x-1 transition-transform">
                    View Details
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setSelectedComplaint(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`p-8 text-white relative ${selectedComplaint.priority === 'Critical' ? 'bg-rose-600' : 'bg-indigo-600'}`}>
              <button 
                onClick={() => setSelectedComplaint(null)}
                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-xs font-bold bg-white/20 inline-block px-3 py-1 rounded uppercase tracking-widest mb-4">
                Case #{selectedComplaint.id}
              </div>
              <h2 className="text-2xl font-bold">{selectedComplaint.subject}</h2>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Status</div>
                  <div className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold ${STATUS_COLORS[selectedComplaint.status]}`}>
                    {selectedComplaint.status}
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Priority</div>
                  <div className="text-slate-900 font-bold">{selectedComplaint.priority}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Description</div>
                <div className="text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl italic border-l-4 border-indigo-200">
                  "{selectedComplaint.description}"
                </div>
              </div>



              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Submitted By</div>
                  <div className="text-slate-900 font-semibold">
                    {selectedComplaint.isAnonymous ? 'Restricted Identity (Anonymous)' : `${selectedComplaint.studentName} (${selectedComplaint.studentId})`}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
