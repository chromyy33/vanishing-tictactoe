'use client';

import React from 'react';
import { Board as BoardType, GameState } from '../lib/game/types';
import { Cell } from './Cell';

interface BoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ gameState, onCellClick, disabled }) => {
  const { board, oldestBlinkingIndex, winningLine } = gameState;

  // Calculate coordinates for winning SVG line overlay
  const getLineCoordinates = (line: [number, number, number]) => {
    // 3x3 grid cell center percentages
    const centers: Record<number, { x: number; y: number }> = {
      0: { x: 16.6, y: 16.6 }, 1: { x: 50, y: 16.6 }, 2: { x: 83.3, y: 16.6 },
      3: { x: 16.6, y: 50 },   4: { x: 50, y: 50 },   5: { x: 83.3, y: 50 },
      6: { x: 16.6, y: 83.3 }, 7: { x: 50, y: 83.3 }, 8: { x: 83.3, y: 83.3 },
    };

    const start = centers[line[0]];
    const end = centers[line[2]];
    return { x1: `${start.x}%`, y1: `${start.y}%`, x2: `${end.x}%`, y2: `${end.y}%` };
  };

  return (
    <div className="board-perspective relative p-4 flex items-center justify-center">
      <div className="board-grid-3d relative grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-3xl bg-slate-950/70 border border-slate-800 shadow-2xl backdrop-blur-xl">
        
        {/* Render 9 Cells */}
        {board.map((cellValue, idx) => (
          <Cell
            key={idx}
            index={idx}
            value={cellValue}
            isBlinking={oldestBlinkingIndex === idx}
            isWinningCell={winningLine ? winningLine.includes(idx) : false}
            disabled={disabled}
            onClick={() => onCellClick(idx)}
          />
        ))}

        {/* SVG Overlay Laser Winning Line */}
        {winningLine && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible p-4">
            <line
              {...getLineCoordinates(winningLine)}
              className="winning-line"
              stroke="#38bdf8"
              strokeWidth="10"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
    </div>
  );
};
