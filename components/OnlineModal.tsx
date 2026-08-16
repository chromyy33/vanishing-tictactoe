'use client';

import React, { useState } from 'react';
import { Globe, Users, Copy, Check, Loader2, ArrowRight, X } from 'lucide-react';

interface OnlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinQueue: () => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  waitingForOpponent: boolean;
  activeRoomId: string | null;
  assignedSymbol: 'X' | 'O' | null;
  errorMessage: string | null;
}

export const OnlineModal: React.FC<OnlineModalProps> = ({
  isOpen,
  onClose,
  onJoinQueue,
  onCreateRoom,
  onJoinRoom,
  waitingForOpponent,
  activeRoomId,
  assignedSymbol,
  errorMessage,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (activeRoomId) {
      navigator.clipboard.writeText(activeRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl space-y-6" style={{ background: 'var(--bg-surface)' }}>
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: 'var(--neon-o)' }} />
            <span className="font-display text-2xl tracking-wider text-white">Online Multiplayer</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close online modal"
            className="p-1.5 rounded-full transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'white')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl border text-xs font-semibold" style={{ background: 'rgba(255,71,87,0.1)', borderColor: 'rgba(255,71,87,0.4)', color: 'var(--neon-x)' }}>
            {errorMessage}
          </div>
        )}

        {/* Waiting state */}
        {waitingForOpponent ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 animate-spin" style={{ borderColor: 'rgba(163,230,53,0.2)', borderTopColor: 'var(--neon-o)' }}></div>
              <Loader2 className="w-6 h-6 absolute animate-spin" style={{ color: 'var(--neon-o)' }} />
            </div>
            <div>
              <div className="text-sm font-bold text-white uppercase tracking-wider">Searching for an opponent...</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Please keep this window open</div>
            </div>
            {activeRoomId && (
              <div className="flex items-center gap-2 p-3 rounded-xl border border-white/10 mt-2" style={{ background: 'var(--bg-card)' }}>
                <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Room Code:</span>
                <span className="font-mono text-sm font-bold" style={{ color: 'var(--neon-o)' }}>{activeRoomId}</span>
                <button
                  onClick={handleCopyCode}
                  aria-label="Copy Room Code"
                  className="p-1 hover:text-white cursor-pointer transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {copied ? <Check className="w-4 h-4" style={{ color: 'var(--neon-o)' }} /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Quick Matchmaking Button */}
            <button
              onClick={onJoinQueue}
              className="w-full p-4 rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-between shadow-lg transition-all active:scale-98 cursor-pointer"
              style={{ background: 'var(--neon-o)', color: '#0d0d0d', boxShadow: '0 4px 20px rgba(163,230,53,0.2)' }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Quick Match (Random Player)</span>
              </div>
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Or Private Room</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            {/* Create Private Room */}
            <button
              onClick={onCreateRoom}
              className="w-full p-3.5 rounded-xl border border-white/10 text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer hover:bg-white/5"
              style={{ background: 'var(--bg-card)' }}
            >
              <span>Create Private Room</span>
            </button>

            {/* Join Room Code Input */}
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                placeholder="ENTER ROOM CODE"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white placeholder-[#555555] font-mono text-sm uppercase tracking-wider focus:outline-none transition-colors"
              style={{ background: 'var(--bg-base)', color: 'white' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--neon-o)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
              <button
                onClick={() => {
                  if (inputCode.trim()) {
                    onJoinRoom(inputCode.trim());
                  }
                }}
                disabled={!inputCode.trim()}
                className="px-5 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              style={{ background: 'var(--neon-o)', color: '#0d0d0d' }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
              >
                Join
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
