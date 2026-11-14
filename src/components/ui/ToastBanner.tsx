'use client';

import React from 'react';
import { useAppState } from '@/context/AppStateContext';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export const ToastBanner: React.FC = () => {
  const { toastMessage, clearToast } = useAppState();

  if (!toastMessage) return null;

  const isWarning = toastMessage.includes('Strict 48H Policy') || toastMessage.includes('forfeited');

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200">
      <div
        className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
          isWarning
            ? 'bg-red-950/90 border-red-800/80 text-red-200'
            : 'bg-neutral-900/95 border-amber-500/40 text-neutral-100'
        }`}
      >
        <div className="mt-0.5">
          {isWarning ? (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          )}
        </div>
        <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">{toastMessage}</div>
        <button
          onClick={clearToast}
          className="text-neutral-400 hover:text-white p-0.5 rounded-md"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
