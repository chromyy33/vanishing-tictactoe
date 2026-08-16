'use client';

import React from 'react';
import { UserX } from 'lucide-react';

interface OpponentLeftModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

export const OpponentLeftModal: React.FC<OpponentLeftModalProps> = ({
  isOpen,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6 text-center"
        style={{ background: 'var(--bg-surface)' }}
      >
        {/* Header Icon */}
        <div
          className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border border-white/10"
          style={{ background: 'var(--bg-card)', color: 'var(--text-muted)' }}
        >
          <UserX className="w-5 h-5" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="font-display text-2xl tracking-wider text-white">
            OPPONENT LEFT
          </h3>
          <p
            className="text-xs leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Your opponent has left or disconnected from the game. You win by forfeit!
          </p>
        </div>

        {/* Action */}
        <div className="pt-1">
          <button
            onClick={onConfirm}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-widest text-white transition-all cursor-pointer hover:brightness-110 shadow-lg"
            style={{ background: 'var(--neon-x)' }}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};
