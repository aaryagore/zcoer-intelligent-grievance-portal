import React from 'react';
import { Brain, BarChart3, Scale, TrendingUp, AlertTriangle, CheckCircle2, Clock, PieChart, Activity } from 'lucide-react';
import { storage } from '../lib/storage';
import { CATEGORIES } from '../constants';

import type { Complaint } from '../types';

export const MLAnalytics: React.FC = () => {
  const [complaints, setComplaints] = React.useState<Complaint[]>([]);
  const [stats, setStats] = React.useState({ total: 0, pending: 0, resolved: 0, inProgress: 0, critical: 0, high: 0 });

  React.useEffect(() => {
    storage.getComplaints().then(setComplaints);
    storage.getStats().then(setStats);
  }, []);

  const categoryBreakdown = CATEGORIES.map(cat => {
    const catComplaints = complaints.filter(c => c.category === cat);
    const avgScore = catComplaints.length > 0
      ? catComplaints.reduce((acc, c) => acc + (c.mlScore?.finalScore || 50), 0) / catComplaints.length
      : 0;
    const resolved = catComplaints.filter(c => c.status === 'Resolved').length;
    const resolutionRate = catComplaints.length > 0 ? (resolved / catComplaints.length) * 100 : 0;
    return { category: cat, count: catComplaints.length, avgScore, resolutionRate, resolved };
  }).filter(c => c.count > 0).sort((a, b) => b.avgScore - a.avgScore);

  const priorityDist = {
    Critical: complaints.filter(c => c.priority === 'Critical').length,
    High: complaints.filter(c => c.priority === 'High').length,
    Medium: complaints.filter(c => c.priority === 'Medium').length,
    Low: complaints.filter(c => c.priority === 'Low').length,
  };

  const fairnessFlags = complaints.filter(c => c.mlScore?.fairnessFlag);
  const policyViolations = complaints.filter(c => c.policyViolation);

  const avgUrgency = complaints.length > 0
    ? complaints.reduce((acc, c) => acc + (c.mlScore?.urgencyScore || 0), 0) / complaints.length
    : 0;
  const avgSentiment = complaints.length > 0
    ? complaints.reduce((acc, c) => acc + (c.mlScore?.sentimentScore || 0), 0) / complaints.length
    : 0;
  const avgImpact = complaints.length > 0
    ? complaints.reduce((acc, c) => acc + (c.mlScore?.impactScore || 0), 0) / complaints.length
    : 0;
  const avgFinal = complaints.length > 0
    ? complaints.reduce((acc, c) => acc + (c.mlScore?.finalScore || 0), 0) / complaints.length
    : 0;

  const overallResolutionRate = stats.total > 0
    ? Math.round((stats.resolved / stats.total) * 100)
    : 0;

  const avgResolutionHours = (() => {
    const resolved = complaints.filter(c => c.status === 'Resolved' && c.resolvedAt);
    if (resolved.length === 0) return 0;
    const total = resolved.reduce((acc, c) => acc + ((c.resolvedAt! - c.createdAt) / (1000 * 60 * 60)), 0);
    return Math.round(total / resolved.length);
  })();

  // Priority colors for chart
  const priorityColorMap = {
    Critical: { bar: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200' },
    High: { bar: 'bg-orange-500', text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    Medium: { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    Low: { bar: 'bg-slate-400', text: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  };

  if (complaints.length === 0) {
    return (
      <div className="max-w-7xl mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Brain className="w-10 h-10 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">ML Analytics Dashboard</h2>
        <p className="text-slate-500 font-medium">No complaint data yet. Submit a complaint to see ML analytics in action.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-indigo-900 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 blueprint-pattern-light opacity-5"></div>
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-zeal-gold/10 rounded-full blur-[60px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl">
              <Brain className="w-8 h-8 text-zeal-gold" />
            </div>
            <div>
              <span className="text-indigo-300 text-xs font-black uppercase tracking-widest">Intelligent Analytics</span>
              <h1 className="text-4xl font-black">ML Priority Dashboard</h1>
            </div>
          </div>
          <p className="text-indigo-300 max-w-2xl font-medium">
            Real-time analysis of complaint prioritization, fairness metrics, and resolution effectiveness across all stakeholders.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-indigo-50 rounded-xl">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg ML Score</span>
            </div>
            <div className="text-4xl font-black text-indigo-900">{avgFinal.toFixed(1)}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">out of 100</div>
          </div>
          
          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-emerald-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Rate</span>
            </div>
            <div className="text-4xl font-black text-emerald-600">{overallResolutionRate}%</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">{stats.resolved}/{stats.total} cases</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Scale className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fairness Flags</span>
            </div>
            <div className="text-4xl font-black text-amber-600">{fairnessFlags.length}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">priority anomalies</div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-100 border border-slate-100">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Resolution</span>
            </div>
            <div className="text-4xl font-black text-blue-600">{avgResolutionHours}h</div>
            <div className="text-xs text-slate-400 mt-1 font-medium">average time</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: ML Factor Breakdown */}
          <div className="lg:col-span-1 space-y-6">
            {/* Avg ML Factor Scores */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2">
                <Brain className="w-5 h-5 text-indigo-600" />
                <span>Average ML Factors</span>
              </h3>
              <div className="space-y-5">
                {[
                  { label: 'Urgency Score', value: avgUrgency, weight: '35%', color: 'bg-rose-500' },
                  { label: 'Sentiment Score', value: avgSentiment, weight: '25%', color: 'bg-orange-500' },
                  { label: 'Impact Score', value: avgImpact, weight: '25%', color: 'bg-amber-500' },
                  { label: 'Frequency Score', value: complaints.reduce((acc, c) => acc + (c.mlScore?.frequencyScore || 0), 0) / Math.max(complaints.length, 1), weight: '15%', color: 'bg-indigo-500' },
                ].map(factor => (
                  <div key={factor.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-slate-700">{factor.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400 font-medium">w:{factor.weight}</span>
                        <span className="text-sm font-black text-slate-900">{factor.value.toFixed(0)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${factor.color} rounded-full transition-all duration-700 ml-score-bar`}
                        style={{ width: `${factor.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Priority Distribution */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2">
                <PieChart className="w-5 h-5 text-indigo-600" />
                <span>Priority Distribution</span>
              </h3>
              <div className="space-y-4">
                {(Object.entries(priorityDist) as [keyof typeof priorityDist, number][]).map(([priority, count]) => {
                  const colors = priorityColorMap[priority];
                  const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={priority} className={`p-4 rounded-2xl border ${colors.bg} ${colors.border}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-black ${colors.text}`}>{priority}</span>
                        <span className={`text-xl font-black ${colors.text}`}>{count}</span>
                      </div>
                      <div className="h-1.5 bg-white rounded-full overflow-hidden">
                        <div className={`h-full ${colors.bar} rounded-full`} style={{ width: `${pct}%` }}></div>
                      </div>
                      <div className="text-xs text-slate-400 font-medium mt-1">{pct.toFixed(1)}% of total</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Category Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Performance Table */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <span>Category Performance Analysis</span>
              </h3>
              {categoryBreakdown.length === 0 ? (
                <div className="text-center text-slate-400 py-10 font-medium">No data available yet.</div>
              ) : (
                <div className="space-y-4">
                  {categoryBreakdown.map((cat, idx) => (
                    <div key={cat.category} className="group hover:bg-slate-50 -mx-4 px-4 py-3 rounded-2xl transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 w-36 shrink-0">
                          <span className="text-[10px] font-black text-slate-400 w-6">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="text-sm font-black text-slate-900">{cat.category}</span>
                        </div>
                        <div className="flex-grow">
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 ${
                                cat.avgScore >= 70 ? 'bg-rose-500' : 
                                cat.avgScore >= 55 ? 'bg-orange-500' :
                                cat.avgScore >= 35 ? 'bg-amber-500' : 'bg-slate-400'
                              }`}
                              style={{ width: `${cat.avgScore}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 shrink-0 text-right">
                          <div>
                            <div className="text-xs text-slate-400 font-medium">Avg Score</div>
                            <div className="text-sm font-black text-slate-900">{cat.avgScore.toFixed(0)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-medium">Count</div>
                            <div className="text-sm font-black text-slate-900">{cat.count}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-400 font-medium">Resolved</div>
                            <div className="text-sm font-black text-emerald-600">{cat.resolutionRate.toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fairness Analysis */}
            <div className="bg-indigo-900 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-zeal-gold/10 rounded-full blur-[40px]"></div>
              <h3 className="text-lg font-black text-white mb-2 flex items-center space-x-2">
                <Scale className="w-5 h-5 text-zeal-gold" />
                <span>Fairness & Bias Analysis</span>
              </h3>
              <p className="text-indigo-300 text-sm font-medium mb-6">
                Our ML engine flags complaints where assigned priority deviates significantly from category averages.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-black text-zeal-gold">{fairnessFlags.length}</div>
                  <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-1">Fairness Flags</div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4">
                  <div className="text-2xl font-black text-rose-400">{policyViolations.length}</div>
                  <div className="text-xs text-indigo-300 font-bold uppercase tracking-wider mt-1">Policy Violations</div>
                </div>
              </div>

              {fairnessFlags.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs font-black text-indigo-300 uppercase tracking-widest">Flagged Cases:</div>
                  {fairnessFlags.slice(0, 3).map(f => (
                    <div key={f.id} className="bg-white/10 rounded-xl p-4 flex items-center space-x-3">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="text-white text-xs font-black">#{f.id} — {f.subject.substring(0, 40)}...</div>
                        <div className="text-indigo-300 text-[10px] mt-0.5">Score: {f.mlScore?.finalScore.toFixed(0)} | Category: {f.category}</div>
                      </div>
                    </div>
                  ))}
                  {fairnessFlags.length > 3 && (
                    <div className="text-indigo-400 text-xs font-medium text-center">+ {fairnessFlags.length - 3} more flags</div>
                  )}
                </div>
              ) : (
                <div className="bg-white/5 rounded-2xl p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                  <div className="text-white font-black">No Fairness Issues</div>
                  <div className="text-indigo-300 text-xs mt-1">All priority assignments are within normal deviation.</div>
                </div>
              )}
            </div>

            {/* Resolution Effectiveness */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                <span>Resolution Effectiveness</span>
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <div className="text-3xl font-black text-emerald-600">{stats.resolved}</div>
                  <div className="text-xs font-bold text-emerald-500 uppercase tracking-wider mt-1">Resolved</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="text-3xl font-black text-blue-600">{stats.inProgress}</div>
                  <div className="text-xs font-bold text-blue-500 uppercase tracking-wider mt-1">In Progress</div>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <div className="text-3xl font-black text-amber-600">{stats.pending}</div>
                  <div className="text-xs font-bold text-amber-500 uppercase tracking-wider mt-1">Pending</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                  <span>Overall Progress</span>
                  <span>{overallResolutionRate}%</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                    style={{ width: `${overallResolutionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
