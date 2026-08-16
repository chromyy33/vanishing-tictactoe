'use client';

import React, { useEffect, useState } from 'react';
import { AIDifficulty, GameMode } from '../lib/game/types';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { MouseTrail } from './MouseTrail';

export type OnlineAction = 'quick_match' | 'create_room' | 'join_room';

interface ModeSelectorProps {
  isOpen: boolean;
  currentMode: GameMode;
  currentDifficulty: AIDifficulty;
  onSelectMode: (mode: GameMode, difficulty?: AIDifficulty, onlineAction?: OnlineAction) => void;
  onClose: () => void;
  /** If false (e.g. first load), no back arrow is shown */
  isInGame?: boolean;
  onOpenRules?: () => void;
}

// Tiny animated preview board — purely decorative
function AnimatedPreview() {
  const [activeCells, setActiveCells] = useState<{ index: number; player: 'X' | 'O' }[]>([]);

  useEffect(() => {
    const sequence: { index: number; player: 'X' | 'O' }[] = [
      { index: 4, player: 'X' },
      { index: 0, player: 'O' },
      { index: 2, player: 'X' },
      { index: 6, player: 'O' },
      { index: 8, player: 'X' },
    ];
    let step = 0;

    const advance = () => {
      setActiveCells(prev => {
        const next = [...prev, sequence[step % sequence.length]];
        const xs = next.filter(c => c.player === 'X');
        const os = next.filter(c => c.player === 'O');
        return [...xs.slice(-3), ...os.slice(-3)];
      });
      step++;
    };

    advance();
    const timer = setInterval(advance, 1800);
    return () => clearInterval(timer);
  }, []);

  const cellMap: Record<number, 'X' | 'O' | null> = {};
  activeCells.forEach(c => { cellMap[c.index] = c.player; });

  return (
    <div className="grid grid-cols-3 gap-1.5 w-[108px] h-[108px] mx-auto">
      {Array.from({ length: 9 }, (_, i) => {
        const player = cellMap[i] ?? null;
        return (
          <div
            key={i}
            className="rounded-lg flex items-center justify-center text-xs font-black transition-all duration-500"
            style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(255,255,255,0.06)',
              width: '32px',
              height: '32px',
              color: player === 'X' ? 'var(--neon-x)' : player === 'O' ? 'var(--neon-o)' : 'transparent',
              textShadow: player === 'X'
                ? '0 0 8px var(--neon-x)'
                : player === 'O'
                ? '0 0 8px var(--neon-o)'
                : 'none',
              transform: player ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {player || ''}
          </div>
        );
      })}
    </div>
  );
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  isOpen,
  currentMode,
  currentDifficulty,
  onSelectMode,
  onClose,
  isInGame = true,
  onOpenRules,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(currentMode);
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(currentDifficulty);

  // Sync with external state when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedMode(currentMode);
      setSelectedDifficulty(currentDifficulty);
    }
  }, [isOpen, currentMode, currentDifficulty]);

  if (!isOpen) return null;

  const handleConfirm = (mode: GameMode, difficulty?: AIDifficulty, onlineAction?: OnlineAction) => {
    onSelectMode(mode, difficulty, onlineAction);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between overflow-y-auto animate-fadeIn"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* Interactive GSAP mouse trailing effect with colorful X's and O's */}
      <MouseTrail />
      {/* Back arrow — only when mid-game */}
      {isInGame && (
        <button
          onClick={onClose}
          aria-label="Back to game"
          className="fixed top-5 left-5 z-60 flex items-center gap-2 transition-colors cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'white')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-xs font-semibold uppercase tracking-wider">Back</span>
        </button>
      )}

      {/* Main Content */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center text-center px-6 py-16 gap-10 flex-1 justify-center">

        {/* Title Block */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="font-display text-fluid-title-main leading-none"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #cccccc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 8px rgba(255,71,87,0.3))',
            }}
          >
            VANISHING
          </h1>
          <span
            className="font-display text-fluid-title-sub leading-none"
            style={{
              background: 'linear-gradient(180deg, #a3e635 0%, #65a30d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 2px 12px rgba(163,230,53,0.5))',
            }}
          >
            TicTacToe
          </span>
          <p
            className="text-fluid-tagline font-medium uppercase mt-3"
            style={{ color: 'var(--text-muted)' }}
          >
            3 marks. Always rolling.
          </p>
        </div>

        {/* Animated Preview Board */}
        <AnimatedPreview />

        {/* Mode Buttons */}
        <div className="w-full flex flex-col gap-3">
          {/* Pass & Play — Primary CTA */}
          <button
            onClick={() => handleConfirm('pass-and-play')}
            className="font-display text-fluid-button tracking-wider w-full py-4 rounded-2xl transition-all duration-200 cursor-pointer hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: 'var(--neon-o)',
              color: '#0d0d0d',
            }}
          >
            Pass &amp; Play
          </button>

          {/* VS Computer — Secondary */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (selectedMode === 'ai') {
                  handleConfirm('ai', selectedDifficulty);
                } else {
                  setSelectedMode('ai');
                }
              }}
              className="font-display text-fluid-button tracking-wider w-full py-4 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: 'transparent',
                color: 'white',
                border: selectedMode === 'ai'
                  ? '1.5px solid var(--neon-o)'
                  : '1.5px solid rgba(255,255,255,0.15)',
                boxShadow: selectedMode === 'ai'
                  ? '0 0 16px rgba(163, 230, 53, 0.15)'
                  : 'none',
              }}
            >
              VS Computer
            </button>

            {/* Difficulty Pills — animate in below when VS Computer selected (styled identical to VS Online pills) */}
            {selectedMode === 'ai' && (
              <div className="grid grid-cols-3 gap-2 animate-fadeIn">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map(diff => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      onClick={() => {
                        setSelectedDifficulty(diff);
                        handleConfirm('ai', diff);
                      }}
                      className={`py-2.5 px-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md ${
                        isSelected
                          ? 'scale-105 border-[var(--neon-o)] text-white'
                          : 'hover:scale-105 hover:border-[var(--neon-o)] hover:bg-white/10 text-zinc-200'
                      }`}
                      style={{
                        background: 'var(--bg-card)',
                        color: isSelected ? 'var(--neon-o)' : 'white',
                        border: isSelected
                          ? '1.5px solid var(--neon-o)'
                          : '1.5px solid rgba(255,255,255,0.12)',
                        boxShadow: isSelected
                          ? '0 0 14px rgba(163,230,53,0.35)'
                          : 'none',
                      }}
                    >
                      {diff.charAt(0).toUpperCase() + diff.slice(1)}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* VS Online — Secondary with LIVE badge */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (selectedMode === 'online') {
                  handleConfirm('online', undefined, 'quick_match');
                } else {
                  setSelectedMode('online');
                }
              }}
              className="font-display text-fluid-button tracking-wider w-full py-4 rounded-2xl transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              style={{
                background: 'transparent',
                color: 'white',
                border: selectedMode === 'online'
                  ? '1.5px solid var(--neon-o)'
                  : '1.5px solid rgba(255,255,255,0.15)',
                boxShadow: selectedMode === 'online'
                  ? '0 0 16px rgba(163, 230, 53, 0.15)'
                  : 'none',
              }}
            >
              VS Online
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-widest"
                style={{ background: 'var(--neon-o)', color: '#0d0d0d', fontFamily: 'var(--font-dm-sans)' }}
              >
                LIVE
              </span>
            </button>

            {/* Online Action Pills — animate in below when VS Online selected */}
            {selectedMode === 'online' && (
              <div className="grid grid-cols-3 gap-2 animate-fadeIn">
                <button
                  onClick={() => handleConfirm('online', undefined, 'quick_match')}
                  className="py-2.5 px-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:scale-105 hover:border-[var(--neon-o)] hover:bg-white/10 text-zinc-200"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Quick Match
                </button>
                <button
                  onClick={() => handleConfirm('online', undefined, 'create_room')}
                  className="py-2.5 px-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:scale-105 hover:border-[var(--neon-o)] hover:bg-white/10 text-zinc-200"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Create Room
                </button>
                <button
                  onClick={() => handleConfirm('online', undefined, 'join_room')}
                  className="py-2.5 px-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md hover:scale-105 hover:border-[var(--neon-o)] hover:bg-white/10 text-zinc-200"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'white',
                    border: '1.5px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Join Room
                </button>
              </div>
            )}
          </div>
        </div>

        {/* How to play link */}
        {onOpenRules && (
          <button
            onClick={onOpenRules}
            className="mt-2 flex items-center gap-1.5 mx-auto transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <HelpCircle className="w-3 h-3" />
            <span className="text-xs uppercase tracking-widest">How to play</span>
          </button>
        )}
      </div>
    </div>
  );
};
