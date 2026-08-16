'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface ConfirmExitModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmExitModal: React.FC<ConfirmExitModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6 text-center" style={{ background: 'var(--bg-surface)' }}>
        
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border border-white/10" style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}>
          <LogOut className="w-5 h-5 ml-0.5" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="font-display text-2xl tracking-wider text-white">EXIT GAME?</h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Are you sure you want to exit to the main menu?
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={onCancel}
            className="py-3 px-4 rounded-xl border border-white/10 text-zinc-400 hover:text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all cursor-pointer"
            style={{ background: 'var(--bg-card)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all cursor-pointer hover:brightness-110 shadow-lg"
            style={{ background: 'var(--neon-x)' }}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
