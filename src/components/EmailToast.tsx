import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle, AlertTriangle, X } from 'lucide-react';

interface MailEvent {
  type: 'receipt' | 'resolution';
  to: string;
  subject: string;
  id: string;
  error?: boolean;
}

export const EmailToast: React.FC = () => {
  const [notification, setNotification] = useState<MailEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as MailEvent;
      setNotification(detail);
      setVisible(true);
      setTimeout(() => setVisible(false), 5000);
      setTimeout(() => setNotification(null), 5500);
    };

    window.addEventListener('zcoer-mail-sent', handler);
    return () => window.removeEventListener('zcoer-mail-sent', handler);
  }, []);

  if (!notification) return null;

  const isResolution = notification.type === 'resolution';
  const hasError = notification.error;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] max-w-sm w-full transition-all duration-500 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
      }`}
    >
      <div className={`rounded-2xl shadow-2xl overflow-hidden border ${
        hasError 
          ? 'bg-rose-50 border-rose-200' 
          : isResolution 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-indigo-50 border-indigo-200'
      }`}>
        <div className={`px-4 py-2 text-xs font-black uppercase tracking-widest text-white ${
          hasError ? 'bg-rose-500' : isResolution ? 'bg-emerald-600' : 'bg-indigo-600'
        }`}>
          {hasError ? '⚠ Email notification failed' : '✉ Email notification dispatched'}
        </div>
        <div className="p-4 flex items-start space-x-3">
          <div className={`p-2 rounded-xl shrink-0 ${
            hasError ? 'bg-rose-100' : isResolution ? 'bg-emerald-100' : 'bg-indigo-100'
          }`}>
            {hasError 
              ? <AlertTriangle className="w-5 h-5 text-rose-600" />
              : isResolution 
                ? <CheckCircle className="w-5 h-5 text-emerald-600" />
                : <Mail className="w-5 h-5 text-indigo-600" />
            }
          </div>
          <div className="flex-grow min-w-0">
            <div className="font-black text-slate-900 text-sm">
              {hasError 
                ? 'Mail delivery failed'
                : isResolution 
                  ? 'Resolution Notice Sent'
                  : 'Complaint Receipt Sent'
              }
            </div>
            <div className="text-xs text-slate-500 mt-0.5 truncate">
              {hasError ? 'Check backend server · ' : 'To: '}{notification.to}
            </div>
            <div className="text-xs font-bold text-slate-700 mt-1 font-mono">
              Case #{notification.id}
            </div>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
