'use client';

import React from 'react';
import { GameState, Player } from '../lib/game/types';
import { Cell } from './Cell';

interface BoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
  disabled: boolean;
  winner?: Player | null;
}

export const Board: React.FC<BoardProps> = ({ gameState, onCellClick, disabled, winner }) => {
  const { board, oldestBlinkingIndex, winningLine } = gameState;

  const borderStyle = winner === 'X'
    ? { borderColor: 'rgba(255,71,87,0.4)', boxShadow: '0 0 30px rgba(255,71,87,0.2)' }
    : winner === 'O'
    ? { borderColor: 'rgba(163,230,53,0.4)', boxShadow: '0 0 30px rgba(163,230,53,0.2)' }
    : { borderColor: 'rgba(255,255,255,0.05)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' };

  return (
    <div className="board-container relative p-2 sm:p-4 flex items-center justify-center">
      {/* Flat-on board frame — overflow:visible so bottom-row glows aren't clipped on iOS Safari */}
      <div
        className="relative grid grid-cols-3 gap-2.5 xs:gap-3 sm:gap-4 p-3 xs:p-4 sm:p-5 rounded-3xl border transition-all duration-700"
        style={{
          background: 'rgba(30,30,30,0.9)',
          overflow: 'visible',
          ...borderStyle,
        }}
      >
        {/* Backdrop blur on a separate inset layer — avoids iOS Safari implicit clipping */}
        <div
          className="absolute inset-0 rounded-3xl backdrop-blur-2xl pointer-events-none"
          style={{ zIndex: 0 }}
        />
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
      </div>
    </div>
  );
};
