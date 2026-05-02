import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, CheckCircle2, ShieldCheck, Zap, GraduationCap, 
  FileSearch, ShieldAlert, Activity, Lock, Timer, 
  Brain, BarChart3, Scale, Sparkles
} from 'lucide-react';
import { storage } from '../lib/storage';

export const LandingPage: React.FC = () => {
  const stats = storage.getStats();
  const currentStudent = storage.getCurrentStudent();

  const featureCards = [
    {
      title: 'AI Priority Engine',
      desc: 'Multi-factor ML scoring: urgency (35%), sentiment (25%), impact (25%), frequency (15%) — auto-classifies every complaint.',
      icon: Brain,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100'
    },
    {
      title: 'Fairness Analytics',
      desc: 'Our engine flags anomalies in priority assignment, ensuring no category or demographic gets systematically underserved.',
      icon: Scale,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100'
    },
    {
      title: 'Email Notifications',
      desc: 'Automated emails on complaint registration and resolution. Every student stays informed throughout the lifecycle.',
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100'
    },
    {
      title: 'Action Timeline',
      desc: 'Administrative response is mandated within 24-96 hours based on ML-assigned priority as per institutional policy.',
      icon: Timer,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100'
    }
  ];

  const processSteps = [
    { num: '01', bg: 'bg-slate-900 text-white', title: 'Identity Verification', sub: 'Secure student login via ZPRN' },
    { num: '02', bg: 'bg-indigo-600 text-white', title: 'ML Analysis', sub: 'Multi-factor priority scoring' },
    { num: '03', bg: 'bg-zeal-gold text-indigo-900', title: 'Auto-Routing', sub: 'Assigned to concerned department' },
    { num: '04', bg: 'bg-emerald-600 text-white', title: 'Resolution + Email', sub: 'Notification dispatched to student' },
  ];

  const resolutionRate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 92;

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-52 zeal-light-gradient overflow-hidden">
        <div className="absolute inset-0 blueprint-pattern-light opacity-60"></div>
        <div className="absolute inset-0 grid-pattern-dark opacity-10"></div>
        
        {/* Glow Blobs */}
        <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-zeal-gold/10 rounded-full blur-[100px] animate-pulse-soft"></div>
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] animate-float"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center space-x-3 bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm mb-10 group cursor-default">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] group-hover:text-indigo-600 transition-colors">Intelligent Redressal 2.0 — ML Powered</span>
              </div>
              
              <h1 className="text-5xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter mb-10">
                Smart <br />
                Grievance <br />
                <span className="text-indigo-600">Justice.</span>
              </h1>
              
              <p className="text-xl text-slate-500 mb-12 leading-relaxed max-w-xl font-medium">
                ZCOER's AI-driven portal uses adaptive ML to classify complaints by urgency, impact, and sentiment. Every grievance gets a <span className="text-indigo-600 font-bold border-b-2 border-zeal-gold">fair, data-driven priority score.</span>
              </p>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                <Link
                  to={currentStudent ? "/submit" : "/login"}
                  className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-2xl font-black text-xl hover:bg-indigo-700 hover:scale-105 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center space-x-3"
                >
                  <span>{currentStudent ? 'Lodge Grievance' : 'Student Login'}</span>
                  <ArrowRight className="w-6 h-6" />
                </Link>
                <Link
                  to="/view"
                  className="w-full sm:w-auto px-12 py-6 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
                >
                  <FileSearch className="w-6 h-6 text-indigo-600" />
                  <span>Track Progress</span>
                </Link>
              </div>
            </div>

            {/* Right Graphic — Live Stats */}
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative z-10 animate-float">
                <div className="glass-monitor p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-zeal-gold/5 rounded-full -mr-16 -mt-16"></div>

                  <div className="flex items-center space-x-3 mb-8">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">ML Live Pulse</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-widest">
                        <span>Resolution Efficiency</span>
                        <span className="text-emerald-600">{resolutionRate}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-shimmer-bg" style={{ width: `${resolutionRate}%` }}></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50/50 p-5 rounded-3xl border border-indigo-100">
                        <div className="text-3xl font-black text-indigo-900 leading-none mb-1">{stats.resolved}</div>
                        <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">Resolved</div>
                      </div>
                      <div className="bg-amber-50/50 p-5 rounded-3xl border border-amber-100">
                        <div className="text-3xl font-black text-amber-600 leading-none mb-1">{stats.total}</div>
                        <div className="text-[10px] font-bold text-amber-400 uppercase tracking-tighter">Total Filed</div>
                      </div>
                      <div className="bg-rose-50/50 p-5 rounded-3xl border border-rose-100">
                        <div className="text-3xl font-black text-rose-600 leading-none mb-1">{stats.critical}</div>
                        <div className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">Critical</div>
                      </div>
                      <div className="bg-emerald-50/50 p-5 rounded-3xl border border-emerald-100">
                        <div className="text-3xl font-black text-emerald-600 leading-none mb-1">{stats.inProgress}</div>
                        <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter">In Progress</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                      <div className="p-2.5 bg-zeal-gold/10 rounded-xl">
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 uppercase">ML Engine Active</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Auto-Classification Running</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -top-10 -left-10 w-40 h-40 border border-indigo-100 rounded-full animate-pulse-soft"></div>
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-zeal-gold/10 rounded-3xl rotate-12"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 font-black text-xs uppercase tracking-[0.2em] rounded-full mb-6 inline-block">Intelligence Engine</span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Four Pillars of Smart Resolution</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featureCards.map((item, idx) => (
            <div key={idx} className={`p-8 rounded-[2.5rem] border ${item.border} ${item.bg} hover:shadow-xl hover:scale-[1.02] transition-all cursor-default group`}>
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-8 shadow-sm group-hover:rotate-6 transition-transform">
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-600 leading-relaxed font-medium text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-white py-32 overflow-hidden border-y border-slate-100 relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="space-y-6">
                {processSteps.map((step, idx) => (
                  <div key={idx} className={`flex items-center space-x-6 ${idx % 2 === 1 ? 'translate-x-8' : ''}`}>
                    <div className={`w-16 h-16 ${step.bg} rounded-2xl flex items-center justify-center text-xl font-black shadow-lg shrink-0`}>{step.num}</div>
                    <div className="flex-grow bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <h4 className="font-black text-slate-900">{step.title}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:pl-10">
              <h2 className="text-4xl font-black text-slate-900 mb-8 leading-tight">Intelligent justice, four steps away.</h2>
              <p className="text-slate-500 text-lg mb-10 leading-relaxed font-medium">
                From submission to resolution, every step is tracked, ML-scored, and <span className="text-indigo-600 font-bold">automatically notified</span> to the student via email.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-xl text-indigo-700 text-sm font-black uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SPPU Regulatory</span>
                </div>
                <div className="flex items-center space-x-2 bg-amber-50 px-4 py-2 rounded-xl text-amber-700 text-sm font-black uppercase tracking-widest">
                  <BarChart3 className="w-4 h-4" />
                  <span>NAAC Compliance</span>
                </div>
                <div className="flex items-center space-x-2 bg-emerald-50 px-4 py-2 rounded-xl text-emerald-700 text-sm font-black uppercase tracking-widest">
                  <Brain className="w-4 h-4" />
                  <span>ML Prioritized</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-indigo-900 py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-8 tracking-tight italic">
            "Your feedback is the catalyst <br className="hidden md:block" /> for institutional excellence."
          </h2>
          <Link
            to={currentStudent ? "/submit" : "/login"}
            className="inline-flex items-center space-x-4 px-12 py-6 bg-zeal-gold text-indigo-950 rounded-2xl font-black text-xl hover:scale-105 transition-all shadow-2xl shadow-yellow-500/20"
          >
            <span>{currentStudent ? 'Start Redressal' : 'Verify Identity First'}</span>
            <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>

      {/* Emergency Strip */}
      <section className="bg-rose-600 py-3">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-10">
          <div className="flex items-center space-x-2 text-white font-black text-[10px] uppercase tracking-[0.2em]">
            <ShieldAlert className="w-4 h-4" />
            <span>24/7 Campus Security Desk:</span>
          </div>
          <span className="text-white font-black text-sm tracking-widest">+91 20 6720 6100</span>
        </div>
      </section>
    </div>
  );
};
