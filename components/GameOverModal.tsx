'use client';

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  useEffect(() => {
    if (!isOpen || !winner) return;
    const end = Date.now() + 1500;
    const colors = winner === 'X'
      ? ['#ff4757', '#ff6b7a', '#ffffff']
      : ['#a3e635', '#c5f135', '#ffffff'];
    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 55,
        origin: { x: 0, y: 0.3 }, colors, scalar: 0.8, zIndex: 9999 });
      confetti({ particleCount: 3, angle: 120, spread: 55,
        origin: { x: 1, y: 0.3 }, colors, scalar: 0.8, zIndex: 9999 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [isOpen, winner]);

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
