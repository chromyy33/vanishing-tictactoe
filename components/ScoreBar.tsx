'use client';

import React, { useState } from 'react';
import { Player, ScoreState, GameMode, AIDifficulty } from '../lib/game/types';
import { Volume2, VolumeX, RotateCcw, Home, Settings, ChevronRight, X as CloseIcon } from 'lucide-react';

interface ScoreBarProps {
  score: ScoreState;
  currentTurn: Player;
  winner?: Player | null;
  mode: GameMode;
  aiDifficulty?: AIDifficulty;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetGame: () => void;
  onOpenModeSelector: () => void;
  onOpenRules: () => void;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({
  score,
  currentTurn,
  winner,
  mode,
  aiDifficulty,
  isMuted,
  onToggleMute,
  onResetGame,
  onOpenModeSelector,
  onOpenRules,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Divider glow: active player's color
  const dividerStyle = winner
    ? winner === 'X'
      ? { borderColor: '#ff4757', boxShadow: '0 0 8px rgba(255,71,87,0.5)' }
      : { borderColor: '#a3e635', boxShadow: '0 0 8px rgba(163,230,53,0.4)' }
    : currentTurn === 'X'
      ? { borderColor: '#ff4757', boxShadow: '0 0 8px rgba(255,71,87,0.5)' }
      : { borderColor: '#a3e635', boxShadow: '0 0 8px rgba(163,230,53,0.4)' };

  const renderIndicator = (side: Player) => {
    if (winner === side) {
      return (
        <div className="flex items-center gap-1.5 mt-2 h-4">
          <span
            className="text-[10px] font-semibold uppercase tracking-widest animate-pulse"
            style={{ color: side === 'X' ? 'var(--neon-x)' : 'var(--neon-o)' }}
          >
            Wins!
          </span>
        </div>
      );
    }
    if (currentTurn === side && !winner) {
      return (
        <div className="flex items-center gap-1.5 mt-2 h-4">
          <span
            className="w-1.5 h-1.5 rounded-full animate-ping flex-shrink-0"
            style={{ background: side === 'X' ? 'var(--neon-x)' : 'var(--neon-o)' }}
          />
          <span
            className="text-[10px] font-medium uppercase tracking-widest"
            style={{ color: side === 'X' ? 'var(--neon-x)' : 'var(--neon-o)' }}
          >
            Your turn
          </span>
        </div>
      );
    }
    return <div className="h-4 mt-2" />;
  };

  const isXActive = !winner && currentTurn === 'X';
  const isOActive = !winner && currentTurn === 'O';
  const xWon = winner === 'X';
  const oWon = winner === 'O';

  return (
    <div className="w-full flex flex-col items-center select-none">
      
      {/* Fixed Viewport Corners */}
      {/* Home Button — Top Left */}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] left-4 z-40">
        <button
          onClick={onOpenModeSelector}
          aria-label="Home"
          title="Home / Mode Selector"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all border border-white/5 cursor-pointer backdrop-blur-md shadow-lg"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* Settings + Restart — Top Right */}
      <div className="fixed top-[max(1rem,env(safe-area-inset-top))] right-4 z-40 flex items-center gap-2">
        {/* Settings Button + Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Settings"
            title="Settings"
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all border border-white/5 cursor-pointer backdrop-blur-md shadow-lg"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Settings Dropdown Panel — flat list layout */}
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-[var(--bg-surface)] border border-white/8 shadow-2xl z-50 overflow-hidden animate-fadeIn backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="font-bold text-white uppercase tracking-widest text-[11px]">Settings</span>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-[var(--text-muted)] hover:text-white transition-colors cursor-pointer"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Sound Effects Row */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                <span className="flex items-center gap-2 text-sm text-zinc-300 font-medium">
                  {isMuted ? <VolumeX className="w-4 h-4 text-[var(--text-muted)]" /> : <Volume2 className="w-4 h-4 text-[var(--neon-o)]" />}
                  Sound effects
                </span>
                {/* Toggle Switch */}
                <button
                  onClick={onToggleMute}
                  aria-label="Toggle sound"
                  className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-all duration-200 cursor-pointer flex-shrink-0 ${
                    !isMuted ? 'bg-[var(--neon-o)]' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                      !isMuted ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* How to Play Row */}
              <button
                onClick={() => {
                  setIsSettingsOpen(false);
                  onOpenRules();
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-zinc-300 font-medium hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <span>How to play</span>
                <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
          )}
        </div>

        {/* Restart Button */}
        <button
          onClick={onResetGame}
          aria-label="Restart"
          title="Restart Game"
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--text-muted)] hover:text-white transition-all border border-white/5 cursor-pointer backdrop-blur-md shadow-lg"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Current Game Mode Badge — pill container preserved, green dot removed */}
      <div className="mb-2 px-3.5 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md flex items-center justify-center shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">
          {mode === 'pass-and-play' && 'PASS & PLAY'}
          {mode === 'ai' && `VS COMPUTER (${aiDifficulty?.toUpperCase() || 'EASY'})`}
          {mode === 'online' && 'ONLINE MULTIPLAYER'}
        </span>
      </div>

      {/* Scoreboard Card — two columns, dynamic divider */}
      <div
        className="w-[270px] xs:w-[296px] sm:w-[360px] md:w-[408px] rounded-2xl border border-white/8 overflow-hidden"
        style={{ background: 'var(--bg-surface)' }}
      >
        <div className="grid grid-cols-2 relative">
          {/* X Column */}
          <div
            className="flex flex-col items-center py-3 px-4 sm:py-4 sm:px-5 transition-colors duration-300"
            style={{
              background: xWon
                ? 'rgba(255, 71, 87, 0.08)'
                : isXActive
                ? 'rgba(255, 71, 87, 0.05)'
                : 'transparent',
            }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1 transition-colors duration-300"
              style={{ color: (isXActive || xWon) ? 'var(--neon-x)' : 'var(--text-muted)' }}
            >
              Player X
            </span>
            <span
              className="font-display text-6xl transition-all duration-300"
              style={{
                color: (isXActive || xWon) ? '#ffffff' : 'var(--text-muted)',
                textShadow: (isXActive || xWon) ? '0 0 16px var(--neon-x-glow)' : 'none',
              }}
            >
              {score.xWins}
            </span>
            {renderIndicator('X')}
          </div>

          {/* Dynamic Vertical Divider — glows in active player color */}
          <div
            className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px transition-all duration-500"
            style={dividerStyle}
          />

          {/* O Column */}
          <div
            className="flex flex-col items-center py-3 px-4 sm:py-4 sm:px-5 border-l transition-colors duration-300"
            style={{
              borderColor: dividerStyle.borderColor,
              background: oWon
                ? 'rgba(163, 230, 53, 0.08)'
                : isOActive
                ? 'rgba(163, 230, 53, 0.05)'
                : 'transparent',
            }}
          >
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.2em] mb-1 transition-colors duration-300"
              style={{ color: (isOActive || oWon) ? 'var(--neon-o)' : 'var(--text-muted)' }}
            >
              Player O
            </span>
            <span
              className="font-display text-6xl transition-all duration-300"
              style={{
                color: (isOActive || oWon) ? '#ffffff' : 'var(--text-muted)',
                textShadow: (isOActive || oWon) ? '0 0 16px var(--neon-o-glow)' : 'none',
              }}
            >
              {score.oWins}
            </span>
            {renderIndicator('O')}
          </div>
        </div>
      </div>
    </div>
  );
};
