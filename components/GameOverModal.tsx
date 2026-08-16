'use client';

import React from 'react';
import { Player } from '../lib/game/types';

interface GameOverModalProps {
  isOpen: boolean;
  winner: Player | null;
  mySymbol?: Player;
  isOnlineMode?: boolean;
  onPlayAgain: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  winner,
  mySymbol,
  isOnlineMode,
  onPlayAgain,
}) => {
  if (!isOpen || !winner) return null;

  const colorVar = winner === 'X' ? 'var(--neon-x)' : 'var(--neon-o)';
  const glowVar = winner === 'X' ? 'var(--neon-x-glow)' : 'var(--neon-o-glow)';
  const label = isOnlineMode
    ? (winner === mySymbol ? 'You win' : 'Opponent wins')
    : `Player ${winner} wins`;

  return (
    <div style={{ color: colorVar }} className="text-center py-3 animate-fadeIn">
      <span
        className="font-display text-5xl tracking-wider"
        style={{ textShadow: `0 0 16px ${glowVar}` }}
      >
        {label}
      </span>
    </div>
  );
};
