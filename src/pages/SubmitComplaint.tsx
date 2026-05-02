import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  AlertCircle, CheckCircle2, ChevronDown, EyeOff, Send,
  User, MessageSquare, ShieldAlert, Skull, ShieldX,
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import type { Category, Complaint } from '../types';
import { storage } from '../lib/storage';
import { emailService } from '../lib/emailService';
import { mlPrioritize, detectAbuse } from '../lib/mlEngine';

export const SubmitComplaint: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentStudent = storage.getCurrentStudent();
  
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [category, setCategory] = React.useState<Category>('Academics');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionStep, setSubmissionStep] = React.useState<'idle' | 'analyzing' | 'submitting' | 'emailing'>('idle');
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [policyNotice, setPolicyNotice] = React.useState<string | null>(null);
  const [detectedAbuse, setDetectedAbuse] = React.useState(false);

  // Mandatory Login Check
  React.useEffect(() => {
    if (!currentStudent) {
      navigate('/login', { state: { message: 'Authentication required to lodge a grievance.', from: location.pathname } });
    }
  }, [currentStudent, navigate, location]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    setIsSubmitting(true);
    setSubmissionStep('analyzing');
    setPolicyNotice(null);

    // Detect abuse
    const isAbusive = detectAbuse(description);
    
    // Run ML prioritization
    const { priority, mlScore } = await mlPrioritize(category, subject, description, isAbusive);
    
    // Policy Violation Logic
    let forceDisclosure = false;
    if (isAbusive) {
      setDetectedAbuse(true);
      forceDisclosure = true;
      setPolicyNotice("AI detected abusive language or policy violation. Anonymous protection is VOID. Your identity (ZPRN) is being attached to this record.");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setSubmissionStep('submitting');
    await new Promise(resolve => setTimeout(resolve, 800));

    const finalAnonymous = forceDisclosure ? false : isAnonymous;

    const newComplaint: Complaint = {
      id: "ZES-" + Math.random().toString(36).substr(2, 7).toUpperCase(),
      category,
      subject,
      description,
      isAnonymous: finalAnonymous,
      policyViolation: forceDisclosure,
      studentName: finalAnonymous ? undefined : currentStudent.name,
      studentId: finalAnonymous ? undefined : currentStudent.zprn,
      studentEmail: currentStudent.email,
      createdAt: Date.now(),
      status: 'Pending',
      priority,
      mlScore,
      emailSent: false,
      resolutionEmailSent: false,
    };

    await storage.saveComplaint(newComplaint);
    
    // Send email notification
    setSubmissionStep('emailing');
    await emailService.sendComplaintRaisedEmail(currentStudent, newComplaint);
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    setTimeout(() => {
      navigate('/view');
    }, 2500);
  };



  if (!currentStudent) return null;

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-4 text-center">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl animate-bounce ${detectedAbuse ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          {detectedAbuse ? <Skull className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
        </div>
        
        <h2 className="text-5xl font-black text-indigo-950 mb-4 tracking-tighter">
          {detectedAbuse ? 'POLICY VIOLATION' : 'CASE REGISTERED'}
        </h2>
        <p className="text-slate-500 mb-12 text-xl font-medium">
          {detectedAbuse 
            ? 'Your complaint has been flagged and your identity disclosed due to policy violations.' 
            : 'Your grievance has been intelligently processed and routed.'}
        </p>

        {/* Digital Receipt Card */}
        <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-2xl shadow-indigo-100/50 overflow-hidden text-left animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="bg-indigo-950 p-6 flex justify-between items-center">
            <span className="text-zeal-gold font-black tracking-widest text-xs uppercase">Official Receipt</span>
            <span className="text-white/50 text-xs font-mono">ZCOER-IRS-2026</span>
          </div>
          <div className="p-10 space-y-8">
            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Complaint Reference</p>
                <h3 className="text-3xl font-black text-indigo-900 font-mono tracking-tighter">REF-{Math.random().toString(36).substr(2, 6).toUpperCase()}</h3>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Status</p>
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">ACTIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Category</p>
                <p className="text-indigo-950 font-bold text-lg">{category}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">AI Detection</p>
                <span className={`inline-block px-4 py-1 rounded-lg text-sm font-black ${
                  detectedAbuse ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {detectedAbuse ? 'PROFANE' : 'ANALYZED'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1">Subject</p>
              <p className="text-slate-700 font-bold text-xl leading-snug line-clamp-2">{subject}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              Notification dispatched to {currentStudent.email}
            </p>
          </div>
        </div>

        <div className="mt-12 flex items-center justify-center space-x-3 text-indigo-600 font-black animate-pulse">
          <Timer className="w-5 h-5" />
          <span className="uppercase text-xs tracking-widest">Auto-redirecting to dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="mb-12">
        <span className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-2 block">Registration Desk</span>
        <h1 className="text-4xl font-black text-indigo-900">Official Redressal Form</h1>
        <p className="text-slate-500 mt-3 text-lg">
          Logged in as <span className="text-indigo-600 font-bold">{currentStudent.name}</span> · Email: <span className="text-slate-700 font-medium">{currentStudent.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {policyNotice && (
          <div className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl shadow-rose-200 flex items-start space-x-4 animate-bounce">
            <ShieldX className="w-8 h-8 shrink-0" />
            <div>
              <h4 className="font-black text-lg uppercase tracking-tight">Critical Policy Alert</h4>
              <p className="font-bold text-sm opacity-90">{policyNotice}</p>
            </div>
          </div>
        )}

        {/* Anonymous Toggle */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-indigo-200 transition-colors">
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-2xl transition-colors ${isAnonymous ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
              <EyeOff className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-indigo-950 text-lg">Report Anonymously</h3>
              <p className="text-sm text-slate-500 font-medium">Identity is masked unless Code of Conduct is violated.</p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${isAnonymous ? 'bg-indigo-600' : 'bg-slate-300'}`}
          >
            <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition-transform ${isAnonymous ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left: Classification */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-indigo-950 flex items-center space-x-3">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
                <span>Classification</span>
              </h2>
              
              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Complaint Category *</label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-700 mb-3 uppercase tracking-wider">Subject Title *</label>
                <input
                  required
                  type="text"
                  placeholder="Summary of the issue..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all"
                />
              </div>



              <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
                <div className="flex items-center space-x-3 text-indigo-700 mb-2">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-xs font-black uppercase tracking-widest">Anti-Abuse Monitor</span>
                </div>
                <p className="text-xs text-indigo-900/60 leading-relaxed font-medium">
                  ZCOER maintains zero tolerance for abusive language. AI monitors submissions.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Identity + Description */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-xl font-black text-indigo-950 flex items-center space-x-3">
                <User className="w-6 h-6 text-indigo-600" />
                <span>Identity Status</span>
              </h2>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Mode:</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isAnonymous ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isAnonymous ? 'Anonymous (Conditional)' : 'Identified'}
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email:</span>
                  <span className="text-xs font-bold text-slate-700">{currentStudent.email}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold bg-amber-50 p-4 rounded-xl border border-amber-100">
                  📧 A confirmation email will be sent to your registered email upon submission.
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-xl font-black text-indigo-950 flex items-center space-x-3">
                <AlertCircle className="w-6 h-6 text-indigo-600" />
                <span>Description</span>
              </h2>
              <div>
                <textarea
                  required
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the incident clearly... The ML engine analyzes your text for urgency, impact, and sentiment in real-time."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-900 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all resize-none"
                ></textarea>

              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-6 pt-4">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => navigate('/')}
            className="px-10 py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl font-black hover:bg-slate-50 transition-all uppercase text-sm tracking-widest"
          >
            Discard
          </button>
          <button
            disabled={isSubmitting}
            type="submit"
            className={`px-12 py-4 rounded-2xl font-black shadow-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-4 uppercase text-sm tracking-widest ${
              submissionStep === 'analyzing' 
                ? 'bg-zeal-gold text-indigo-950' 
                : submissionStep === 'emailing'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-900 text-white hover:bg-indigo-950'
            }`}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span>
              {submissionStep === 'idle' && 'Submit Complaint'}
              {submissionStep === 'analyzing' && '🤖 ML Analyzing...'}
              {submissionStep === 'submitting' && 'Registering...'}
              {submissionStep === 'emailing' && '📧 Sending Email...'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};
