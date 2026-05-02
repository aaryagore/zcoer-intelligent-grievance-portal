import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Search, User, EyeOff, 
  Briefcase, Skull, Brain, Scale, Mail
} from 'lucide-react';
import { storage } from '../lib/storage';
import type { Complaint, AdminUser } from '../types';
import { STATUS_COLORS } from '../constants';
import { emailService } from '../lib/emailService';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = React.useState<AdminUser | null>(null);
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('All');
  const [sendingEmail, setSendingEmail] = React.useState<string | null>(null);

  React.useEffect(() => {
    const currentAdmin = storage.getCurrentAdmin();
    if (!currentAdmin) {
      navigate('/admin/login');
      return;
    }
    setAdmin(currentAdmin);
    
    storage.getComplaints().then((allComplaints) => {
      if (currentAdmin.assignedCategory === 'ALL') {
        setComplaints(allComplaints);
      } else {
        setComplaints(allComplaints.filter(c => c.category === currentAdmin.assignedCategory));
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    storage.logoutAdmin();
    navigate('/admin/login');
  };

  const handleStatusUpdate = async (id: string, newStatus: Complaint['status']) => {
    await storage.updateComplaintStatus(id, newStatus);
    
    const updated = complaints.map(c => {
      if (c.id === id) {
        return { ...c, status: newStatus, resolvedAt: newStatus === 'Resolved' ? Date.now() : c.resolvedAt };
      }
      return c;
    });
    setComplaints(updated);

    if (newStatus === 'Resolved') {
      const target = updated.find(c => c.id === id);
      if (target) {
        setSendingEmail(id);
        await emailService.sendComplaintResolvedEmail(target);
        setSendingEmail(null);
      }
    }
  };

  const filtered = complaints.filter(c => {
    const matchesSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort by ML score (highest first = most urgent)
  const sortedFiltered = [...filtered].sort((a, b) => {
    const scoreA = a.mlScore?.finalScore || 0;
    const scoreB = b.mlScore?.finalScore || 0;
    return scoreB - scoreA;
  });

  const getPriorityBadgeClass = (priority: Complaint['priority']) => {
    switch (priority) {
      case 'Critical': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'High': return 'text-orange-600 bg-orange-50 border-orange-100';
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'Low': return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  if (!admin) return null;

  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Resolved').length;
  const fairnessFlags = complaints.filter(c => c.mlScore?.fairnessFlag).length;

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Dashboard Header */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Briefcase className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-tight">{admin.name}</h1>
                <div className="flex items-center space-x-3 mt-1 flex-wrap gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                    Dept: {admin.assignedCategory}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                    Role: {admin.role}
                  </span>
                  {criticalCount > 0 && (
                    <span className="text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-600 px-2 py-0.5 rounded animate-pulse">
                      ⚠ {criticalCount} CRITICAL PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending</div>
            <div className="text-3xl font-black text-slate-900">{complaints.filter(c => c.status === 'Pending').length}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-blue-500">
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">In Progress</div>
            <div className="text-3xl font-black text-blue-600">{complaints.filter(c => c.status === 'In Progress').length}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-emerald-500">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolved</div>
            <div className="text-3xl font-black text-emerald-600">{complaints.filter(c => c.status === 'Resolved').length}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-rose-200 shadow-sm border-l-4 border-l-rose-600">
            <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Critical 🔴</div>
            <div className="text-3xl font-black text-rose-600">{complaints.filter(c => c.priority === 'Critical').length}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-rose-400">
            <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-1">Policy Violat.</div>
            <div className="text-3xl font-black text-rose-500">{complaints.filter(c => c.policyViolation).length}</div>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm border-l-4 border-l-amber-500">
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center space-x-1">
              <Scale className="w-3 h-3" /><span>Fairness Flags</span>
            </div>
            <div className="text-3xl font-black text-amber-600">{fairnessFlags}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Subject or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-5 py-3.5 font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-2xl px-5 py-3.5 font-medium outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-600 transition-all"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {/* Info bar */}
        <div className="flex items-center space-x-2 mb-4 text-xs text-slate-500 font-medium">
          <Brain className="w-3.5 h-3.5 text-indigo-600" />
          <span>Sorted by ML Priority Score (highest urgency first)</span>
          <span className="text-slate-300">·</span>
          <span>{sortedFiltered.length} complaints shown</span>
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {sortedFiltered.length === 0 ? (
            <div className="bg-white p-20 rounded-[3rem] text-center border border-slate-200">
              <Search className="w-10 h-10 text-slate-300 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900">Queue is Clear</h3>
            </div>
          ) : (
            sortedFiltered.map((c) => (
              <div key={c.id} className={`bg-white rounded-[2rem] border p-8 shadow-sm transition-shadow hover:shadow-md ${
                c.priority === 'Critical' 
                  ? 'border-rose-300 ring-2 ring-rose-50' 
                  : c.policyViolation 
                    ? 'border-rose-200 ring-1 ring-rose-50' 
                    : 'border-slate-200'
              }`}>
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className="flex-grow">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase">#{c.id}</span>
                      <span className={`text-[10px] font-black px-2 py-1 rounded uppercase border ${getPriorityBadgeClass(c.priority)}`}>
                        {c.priority === 'Critical' && '🔴 '}
                        {c.priority === 'High' && '🟠 '}
                        {c.priority === 'Medium' && '🟡 '}
                        {c.priority === 'Low' && '⚪ '}
                        {c.priority} Priority
                      </span>
                      {c.mlScore && (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase flex items-center space-x-1">
                          <Brain className="w-3 h-3" />
                          <span>ML: {c.mlScore.finalScore.toFixed(0)}/100</span>
                        </span>
                      )}
                      {c.mlScore?.fairnessFlag && (
                        <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded uppercase flex items-center space-x-1">
                          <Scale className="w-3 h-3" />
                          <span>Fairness Flag</span>
                        </span>
                      )}
                      {c.policyViolation && (
                        <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-1 rounded uppercase flex items-center">
                          <Skull className="w-3 h-3 mr-1" />Policy Violation
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-black text-slate-900 mb-2">{c.subject}</h2>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4 italic">"{c.description}"</p>

                    {/* ML Score Bar */}
                    {c.mlScore && (
                      <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center space-x-1">
                            <Brain className="w-3 h-3" /><span>ML Analysis</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-600">{c.mlScore.reasoning.substring(0, 80)}...</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: 'Urgency', value: c.mlScore.urgencyScore },
                            { label: 'Sentiment', value: c.mlScore.sentimentScore },
                            { label: 'Impact', value: c.mlScore.impactScore },
                            { label: 'Frequency', value: c.mlScore.frequencyScore },
                          ].map(metric => (
                            <div key={metric.label}>
                              <div className="text-[9px] font-black text-slate-400 uppercase mb-1">{metric.label}</div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-indigo-600 rounded-full"
                                  style={{ width: `${metric.value}%` }}
                                ></div>
                              </div>
                              <div className="text-[9px] text-slate-500 mt-0.5">{metric.value.toFixed(0)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-4">
                      {c.isAnonymous && !c.policyViolation ? (
                        <div className="flex items-center text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-xs font-bold">
                          <EyeOff className="w-3.5 h-3.5 mr-2" />
                          <span>Identity Masked</span>
                        </div>
                      ) : (
                        <div className={`flex items-center px-3 py-1 rounded-full text-xs font-bold ${c.policyViolation ? 'bg-rose-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                          <User className="w-3.5 h-3.5 mr-2" />
                          <span>{c.studentName || 'Unknown'} ({c.studentId || 'Anonymous'})</span>
                        </div>
                      )}
                      {c.studentEmail && !c.isAnonymous && (
                        <div className="flex items-center text-slate-500 text-xs font-medium">
                          <Mail className="w-3 h-3 mr-1" />
                          {c.studentEmail}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Panel */}
                  <div className="flex flex-col items-center gap-3 lg:w-56 pt-4 lg:pt-0 lg:pl-8 lg:border-l border-slate-100 shrink-0">
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <button 
                        onClick={() => handleStatusUpdate(c.id, 'In Progress')}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          c.status === 'In Progress' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50'
                        }`}
                      >
                        Process
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(c.id, 'Resolved')}
                        disabled={sendingEmail === c.id}
                        className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                          c.status === 'Resolved' 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : sendingEmail === c.id
                              ? 'bg-emerald-100 text-emerald-600 border-emerald-200 cursor-wait'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        {sendingEmail === c.id ? '📧...' : 'Resolve'}
                      </button>
                    </div>
                    <div className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </div>
                    {sendingEmail === c.id && (
                      <div className="text-[10px] text-emerald-600 font-bold animate-pulse">
                        📧 Sending resolution email...
                      </div>
                    )}
                    <div className="text-[10px] text-slate-400 font-medium text-center">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
