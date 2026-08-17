'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, GameMode, AIDifficulty, Player, ScoreState } from '../lib/game/types';
import { createInitialState, makeMove } from '../lib/game/logic';
import { getAIMove } from '../lib/game/ai';
import { soundManager } from '../lib/audio';
import { getSocket, connectSocket } from '../lib/socket/client';
import { Board } from '../components/Board';
import { ScoreBar } from '../components/ScoreBar';
import { ModeSelector } from '../components/ModeSelector';
import { OnlineModal } from '../components/OnlineModal';
import { GameOverModal } from '../components/GameOverModal';
import { ConfirmExitModal } from '../components/ConfirmExitModal';
import { OpponentLeftModal } from '../components/OpponentLeftModal';
import { X, UserX } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [score, setScore] = useState<ScoreState>({ xWins: 0, oWins: 0, ties: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [isModeSelectorOpen, setIsModeSelectorOpen] = useState(true);
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState(false);
  const [showRulesInfo, setShowRulesInfo] = useState(false);
  const [showConfirmExitModal, setShowConfirmExitModal] = useState(false);

  // Online Multiplayer State
  const [waitingForOpponent, setWaitingForOpponent] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [assignedSymbol, setAssignedSymbol] = useState<'X' | 'O' | null>(null);
  const [onlineError, setOnlineError] = useState<string | null>(null);
  const [rematchPending, setRematchPending] = useState(false);
  const [rematchRequestedByOpponent, setRematchRequestedByOpponent] = useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);

  // Home Click Handler with Exit Confirmation
  const handleHomeClick = () => {
    const isGameInProgress =
      (gameState.board.some(cell => cell !== null) && gameState.status === 'playing') ||
      gameState.mode === 'online';
    if (isGameInProgress) {
      setShowConfirmExitModal(true);
    } else {
      setIsModeSelectorOpen(true);
    }
  };

  const handleConfirmExit = () => {
    if (gameState.mode === 'online' && activeRoomId) {
      const socket = getSocket();
      socket.emit('leave_room', { roomId: activeRoomId });
    }
    setShowConfirmExitModal(false);
    setGameState(createInitialState());
    setScore({ xWins: 0, oWins: 0, ties: 0 });
    setWaitingForOpponent(false);
    setActiveRoomId(null);
    setAssignedSymbol(null);
    setRematchPending(false);
    setRematchRequestedByOpponent(false);
    setOpponentDisconnected(false);
    setIsModeSelectorOpen(true);
  };

  const handleCloseOnlineModal = () => {
    setIsOnlineModalOpen(false);
    setWaitingForOpponent(false);
    setOnlineError(null);
    setActiveRoomId(null);
    setRematchPending(false);
    setRematchRequestedByOpponent(false);
    setIsModeSelectorOpen(true);
  };

  // Load mute setting on mount (score is strictly session-based)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMuted(soundManager.getMuted());
    }
  }, []);

  // Update session scores
  const updateScore = (winner: Player | null) => {
    setScore(prev => ({
      xWins: winner === 'X' ? prev.xWins + 1 : prev.xWins,
      oWins: winner === 'O' ? prev.oWins + 1 : prev.oWins,
      ties: winner === null ? prev.ties + 1 : prev.ties,
    }));
  };

  // Sound Mute Toggle
  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  // Reset / Play Again Handler (Supports Online Rematch Request)
  const handleResetGame = useCallback(() => {
    if (gameState.mode === 'online') {
      if (activeRoomId) {
        const socket = getSocket();
        socket.emit('request_rematch', { roomId: activeRoomId });
        setRematchPending(true);
      }
      return;
    }

    setGameState(prev => ({
      ...createInitialState(),
      mode: prev.mode,
      aiDifficulty: prev.aiDifficulty,
      myPlayerSymbol: prev.myPlayerSymbol
    }));
  }, [gameState.mode, activeRoomId]);

  // Accept Online Rematch
  const handleAcceptRematch = useCallback(() => {
    if (activeRoomId) {
      const socket = getSocket();
      socket.emit('accept_rematch', { roomId: activeRoomId });
    }
  }, [activeRoomId]);

  // Victory Confetti Effect
  useEffect(() => {
    if (gameState.status === 'won' && gameState.winner) {
      const colors = gameState.winner === 'X'
        ? ['#ff4757', '#ff6b7a', '#ffffff']
        : ['#a3e635', '#c5f135', '#ffffff'];

      const duration = 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors,
          scalar: 0.85,
          zIndex: 9999
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors,
          scalar: 0.85,
          zIndex: 9999
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [gameState.status, gameState.winner]);

  // Mode Selection Handler
  const handleSelectMode = (
    mode: GameMode,
    difficulty: AIDifficulty = 'medium',
    onlineAction?: 'quick_match' | 'create_room' | 'join_room'
  ) => {
    setScore({ xWins: 0, oWins: 0, ties: 0 });
    if (mode === 'online') {
      connectSocket();
      const socket = getSocket();
      if (onlineAction === 'quick_match') {
        socket.emit('join_queue');
        setWaitingForOpponent(true);
        setIsOnlineModalOpen(true);
      } else if (onlineAction === 'create_room') {
        socket.emit('create_room');
        setWaitingForOpponent(true);
        setIsOnlineModalOpen(true);
      } else if (onlineAction === 'join_room') {
        setWaitingForOpponent(false);
        setIsOnlineModalOpen(true);
      } else {
        setIsOnlineModalOpen(true);
      }
    } else {
      setGameState({
        ...createInitialState(),
        mode,
        aiDifficulty: difficulty
      });
    }
  };

  // Execute Move Logic
  const handleCellClick = useCallback((index: number) => {
    if (gameState.status !== 'playing') return;

    // Online Mode Check: Player can only move on their turn
    if (gameState.mode === 'online') {
      if (gameState.turn !== assignedSymbol) return;
    }

    // AI Mode Check: Prevent clicking during AI turn
    if (gameState.mode === 'ai' && gameState.turn === 'O') return;

    // Make state move
    const nextState = makeMove(gameState, index);
    if (nextState === gameState) return;

    // Play sounds
    soundManager.playPlaceMark(gameState.turn);
    if (nextState.lastVanishedIndex !== null) {
      soundManager.playVanishMark();
    }

    setGameState(nextState);

    // Online move emission
    if (gameState.mode === 'online' && activeRoomId) {
      const socket = getSocket();
      socket.emit('send_move', {
        roomId: activeRoomId,
        cellIndex: index,
        player: gameState.turn
      });
    }

    // Check game over
    if (nextState.status === 'won') {
      updateScore(nextState.winner);
      soundManager.playWin();
    }
  }, [gameState.status, gameState.turn, gameState.mode, gameState.board, assignedSymbol, activeRoomId]);

  // AI Automatic Move Effect
  useEffect(() => {
    if (
      gameState.mode === 'ai' &&
      gameState.turn === 'O' &&
      gameState.status === 'playing'
    ) {
      const aiTimer = setTimeout(() => {
        const move = getAIMove(gameState, gameState.aiDifficulty);
        if (move !== -1) {
          const nextState = makeMove(gameState, move);
          soundManager.playPlaceMark('O');
          if (nextState.lastVanishedIndex !== null) {
            soundManager.playVanishMark();
          }
          setGameState(nextState);

          if (nextState.status === 'won') {
            updateScore(nextState.winner);
            soundManager.playLoss();
          }
        }
      }, 1100);

      return () => clearTimeout(aiTimer);
    }
  }, [gameState]);

  // Socket.io Online Listeners
  useEffect(() => {
    const socket = getSocket();

    socket.on('queue_waiting', () => {
      setWaitingForOpponent(true);
      setOnlineError(null);
    });

    socket.on('room_created', ({ roomId, symbol }) => {
      setActiveRoomId(roomId);
      setAssignedSymbol(symbol);
      setWaitingForOpponent(true);
      setOnlineError(null);
    });

    socket.on('game_matched', ({ roomId, symbol }) => {
      setActiveRoomId(roomId);
      setAssignedSymbol(symbol);
      setWaitingForOpponent(false);
      setIsOnlineModalOpen(false);
      setOnlineError(null);
      setOpponentDisconnected(false);
      setScore({ xWins: 0, oWins: 0, ties: 0 });

      setGameState({
        ...createInitialState(),
        mode: 'online',
        myPlayerSymbol: symbol
      });
    });

    socket.on('receive_move', ({ cellIndex }) => {
      setGameState(prev => {
        const nextState = makeMove(prev, cellIndex);
        soundManager.playPlaceMark(prev.turn);
        if (nextState.lastVanishedIndex !== null) {
          soundManager.playVanishMark();
        }
        if (nextState.status === 'won') {
          updateScore(nextState.winner);
        }
        return nextState;
      });
    });

    socket.on('rematch_requested', () => {
      setRematchRequestedByOpponent(true);
    });

    socket.on('rematch_started', () => {
      setRematchPending(false);
      setRematchRequestedByOpponent(false);
      setOpponentDisconnected(false);
      setScore({ xWins: 0, oWins: 0, ties: 0 });
      setGameState(prev => ({
        ...createInitialState(),
        mode: 'online',
        myPlayerSymbol: assignedSymbol || prev.myPlayerSymbol || 'X'
      }));
    });

    socket.on('error_message', ({ message }) => {
      setOnlineError(message);
      setWaitingForOpponent(false);
    });

    socket.on('opponent_left', () => {
      setOpponentDisconnected(true);
      setWaitingForOpponent(false);
      setRematchPending(false);
      setRematchRequestedByOpponent(false);
    });

    return () => {
      socket.off('queue_waiting');
      socket.off('room_created');
      socket.off('game_matched');
      socket.off('receive_move');
      socket.off('rematch_requested');
      socket.off('rematch_started');
      socket.off('error_message');
      socket.off('opponent_left');
    };
  }, []);

  return (
    <main className="h-screen h-[100dvh] max-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden select-none selection:bg-[var(--neon-x)] selection:text-white">
      {/* Radial glow spotlight background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(40, 25, 70, 0.35) 0%, rgba(17, 17, 17, 0) 70%)',
        }}
      />

      {/* Unified Game Content Container — centered with tight vertical spacing */}
      <div className="w-full max-w-md flex flex-col items-center justify-center my-auto gap-2 sm:gap-4">
        {/* Top Bar Controls & Scoreboard */}
        <header className="w-full shrink-0 flex flex-col items-center">
          <ScoreBar
            score={score}
            currentTurn={gameState.turn}
            winner={gameState.winner}
            mode={gameState.mode}
            aiDifficulty={gameState.aiDifficulty}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onResetGame={handleResetGame}
            onOpenModeSelector={handleHomeClick}
            onOpenRules={() => setShowRulesInfo(true)}
          />

          {/* Online Player Status Badge */}
          {gameState.mode === 'online' && assignedSymbol && (
            <div
              className="mt-2 sm:mt-3 px-4 py-1.5 rounded-full border flex items-center gap-2 text-xs font-bold uppercase tracking-widest shadow-lg shrink-0 animate-fadeIn"
              style={{
                background: 'var(--bg-surface)',
                borderColor: assignedSymbol === 'X' ? 'rgba(255, 71, 87, 0.4)' : 'rgba(163, 230, 53, 0.4)',
                boxShadow: assignedSymbol === 'X' ? '0 0 16px rgba(255, 71, 87, 0.2)' : '0 0 16px rgba(163, 230, 53, 0.2)',
                color: assignedSymbol === 'X' ? 'var(--neon-x)' : 'var(--neon-o)',
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: assignedSymbol === 'X' ? 'var(--neon-x)' : 'var(--neon-o)' }} />
              <span>YOU ARE PLAYER <strong>{assignedSymbol}</strong></span>
            </div>
          )}
        </header>

        {/* Flat-On Hero Board Centered with Scoreboard */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <Board
            gameState={gameState}
            winner={gameState.winner}
            onCellClick={handleCellClick}
            disabled={
              gameState.status !== 'playing' ||
              (gameState.mode === 'ai' && gameState.turn === 'O') ||
              (gameState.mode === 'online' && gameState.turn !== assignedSymbol)
            }
          />

          {/* Play Again / Rematch Controls — appears below board on game end */}
          {gameState.status === 'won' && (
            <div className="mt-3 sm:mt-4 flex flex-col items-center gap-2" style={{ animation: 'fadeIn 0.3s ease-out 0.3s both' }}>
              {gameState.mode === 'online' ? (
                rematchPending ? (
                  <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-[var(--neon-o)] animate-pulse" />
                    <span>Waiting for opponent to accept...</span>
                  </div>
                ) : rematchRequestedByOpponent ? (
                  <button
                    onClick={handleAcceptRematch}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-[var(--neon-o)] hover:opacity-90 text-black text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-[0_0_20px_rgba(163,230,53,0.4)]"
                  >
                    Accept Rematch
                  </button>
                ) : (
                  <button
                    onClick={handleResetGame}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                  >
                    Play again
                  </button>
                )
              ) : (
                <button
                  onClick={handleResetGame}
                  className="px-6 sm:px-8 py-2.5 sm:py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-lg"
                >
                  Play again
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* How to Play Rules Modal */}
      {showRulesInfo && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div
            className="relative w-full max-w-md rounded-3xl border border-white/10 p-6 shadow-2xl space-y-4 text-left"
            style={{ background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl tracking-wider text-white">How To Play</span>
              <button
                onClick={() => setShowRulesInfo(false)}
                className="p-1 rounded-full hover:text-white cursor-pointer transition-colors" style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ul className="list-disc pl-5 space-y-2.5 text-sm leading-relaxed text-zinc-300">
              <li>Max <strong className="font-semibold text-white">3 marks per player</strong> on the board at any time.</li>
              <li>When you have 3 marks, your <strong className="font-semibold text-white">oldest mark blinks</strong> as a warning.</li>
              <li>Placing your 4th mark automatically <strong className="font-semibold text-white">vanishes the oldest mark</strong>.</li>
              <li>Get 3 in a row to win!</li>
            </ul>
          </div>
        </div>
      )}

      {/* Confirmation Exit Modal */}
      <ConfirmExitModal
        isOpen={showConfirmExitModal}
        onConfirm={handleConfirmExit}
        onCancel={() => setShowConfirmExitModal(false)}
      />

      {/* Full Screen Splash / Mode Selector */}
      <ModeSelector
        isOpen={isModeSelectorOpen}
        currentMode={gameState.mode}
        currentDifficulty={gameState.aiDifficulty}
        onSelectMode={handleSelectMode}
        onClose={() => setIsModeSelectorOpen(false)}
        isInGame={gameState.board.some(cell => cell !== null)}
        onOpenRules={() => setShowRulesInfo(true)}
      />

      <OnlineModal
        isOpen={isOnlineModalOpen}
        onClose={handleCloseOnlineModal}
        onJoinQueue={() => {
          const socket = getSocket();
          socket.emit('join_queue');
        }}
        onCreateRoom={() => {
          const socket = getSocket();
          socket.emit('create_room');
        }}
        onJoinRoom={(code) => {
          const socket = getSocket();
          socket.emit('join_room', { roomId: code });
        }}
        waitingForOpponent={waitingForOpponent}
        activeRoomId={activeRoomId}
        assignedSymbol={assignedSymbol}
        errorMessage={onlineError}
      />

      {/* Opponent Disconnected / Left Modal Overlay */}
      <OpponentLeftModal
        isOpen={opponentDisconnected}
        onConfirm={() => {
          setOpponentDisconnected(false);
          handleConfirmExit();
        }}
      />

      {/* Screen reader live region for turn announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {gameState.status === 'playing'
          ? `Player ${gameState.turn}'s turn`
          : gameState.winner
          ? `Player ${gameState.winner} wins`
          : ''}
      </div>
    </main>
  );
}
