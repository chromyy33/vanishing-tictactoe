'use client';

import React from 'react';
import { CellState, Player } from '../lib/game/types';
import { AlertCircle } from 'lucide-react';

interface CellProps {
  index: number;
  value: CellState;
  isBlinking: boolean;
  isWinningCell: boolean;
  disabled: boolean;
  onClick: () => void;
}

export const Cell: React.FC<CellProps> = ({
  index,
  value,
  isBlinking,
  isWinningCell,
  disabled,
  onClick,
}) => {
  return (
    <button
      id={`cell-${index}`}
      onClick={onClick}
      disabled={disabled || value !== null}
      aria-label={`Board cell ${index + 1}`}
      className={`
        cell-3d relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 
        rounded-2xl border border-slate-700/60 
        flex items-center justify-center 
        cursor-pointer select-none transition-all duration-200
        ${isWinningCell ? 'bg-indigo-900/60 border-amber-400/80 shadow-[0_0_25px_rgba(250,204,21,0.5)]' : 'bg-slate-900/80 backdrop-blur-md'}
        ${disabled && value === null ? 'opacity-60 cursor-not-allowed' : ''}
      `}
    >
      {/* Warning indicator badge for oldest mark */}
      {isBlinking && (
        <span className="absolute top-2 right-2 text-amber-400 animate-bounce flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 border border-amber-500/50 px-1.5 py-0.5 rounded-full z-10 shadow-md">
          <AlertCircle className="w-3 h-3 text-amber-400" />
          Vanishing
        </span>
      )}

      {/* Symbol: X or O */}
      {value !== null && (
        <div
          className={`
            symbol-container flex items-center justify-center transition-all transform duration-300
            ${value === 'X' ? 'symbol-x' : 'symbol-o'}
            ${isBlinking ? 'symbol-blinking' : ''}
          `}
        >
          {value === 'X' ? (
            <svg className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9"></circle>
            </svg>
          )}
        </div>
      )}
    </button>
  );
};
