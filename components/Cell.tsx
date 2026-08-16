'use client';

import React from 'react';
import { CellState } from '../lib/game/types';

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
        cell-3d relative w-[4.6rem] h-[4.6rem] xs:w-20 xs:h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 
        rounded-2xl flex items-center justify-center 
        cursor-pointer select-none transition-all duration-200
        ${
          isWinningCell
            ? value === 'X'
              ? 'bg-[#1e103d] border-[#ff2d78]/70 shadow-[0_0_25px_rgba(255,45,120,0.4)]'
              : 'bg-[#0f2434] border-[#00e5b0]/70 shadow-[0_0_25px_rgba(0,229,176,0.4)]'
            : ''
        }
        ${disabled && value === null ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {/* Symbol: X (Hot Pink Neon) or O (Cyan-Green Neon) */}
      {value !== null && (
        <div
          className={`
            symbol-container flex items-center justify-center transition-all transform duration-300
            ${value === 'X' ? 'symbol-x' : 'symbol-o'}
            ${
              isBlinking
                ? value === 'X'
                  ? 'symbol-blinking-x'
                  : 'symbol-blinking-o'
                : 'animate-symbol-pop'
            }
          `}
        >
          {value === 'X' ? (
            <svg
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="8.5"></circle>
            </svg>
          )}
        </div>
      )}
    </button>
  );
};
