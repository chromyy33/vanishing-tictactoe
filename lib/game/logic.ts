import { Board, GameState, Player, WINNING_COMBINATIONS } from './types';

export function createInitialState(): GameState {
  return {
    board: Array(9).fill(null),
    history: {
      X: [],
      O: []
    },
    turn: 'X',
    status: 'playing',
    winner: null,
    winningLine: null,
    oldestBlinkingIndex: null,
    lastVanishedIndex: null,
    moveCount: 0,
    mode: 'pass-and-play',
    aiDifficulty: 'medium'
  };
}

export function checkWin(board: Board): { winner: Player; line: [number, number, number] } | null {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, line };
    }
  }
  return null;
}

export function calculateBlinkingIndex(history: Record<Player, number[]>, turn: Player): number | null {
  if (history[turn] && history[turn].length >= 3) {
    return history[turn][0];
  }
  return null;
}

export function makeMove(currentState: GameState, cellIndex: number): GameState {
  // If game is over or cell is occupied, return current state unchanged
  if (currentState.status !== 'playing' || currentState.board[cellIndex] !== null) {
    return currentState;
  }

  const currentTurn = currentState.turn;
  const nextTurn: Player = currentTurn === 'X' ? 'O' : 'X';
  const newBoard = [...currentState.board];
  const newHistory = {
    X: [...currentState.history.X],
    O: [...currentState.history.O]
  };

  let vanishedIndex: number | null = null;

  // Vanish oldest mark if player already has 3 marks on board
  if (newHistory[currentTurn].length >= 3) {
    vanishedIndex = newHistory[currentTurn].shift()!;
    newBoard[vanishedIndex] = null;
  }

  // Place new mark
  newBoard[cellIndex] = currentTurn;
  newHistory[currentTurn].push(cellIndex);

  // Check victory condition on current board state
  const winInfo = checkWin(newBoard);

  if (winInfo) {
    return {
      ...currentState,
      board: newBoard,
      history: newHistory,
      status: 'won',
      winner: winInfo.winner,
      winningLine: winInfo.line,
      oldestBlinkingIndex: null,
      lastVanishedIndex: vanishedIndex,
      moveCount: currentState.moveCount + 1
    };
  }

  // Calculate blinking mark for next turn's player
  const nextBlinkingIndex = calculateBlinkingIndex(newHistory, nextTurn);

  return {
    ...currentState,
    board: newBoard,
    history: newHistory,
    turn: nextTurn,
    status: 'playing',
    oldestBlinkingIndex: nextBlinkingIndex,
    lastVanishedIndex: vanishedIndex,
    moveCount: currentState.moveCount + 1
  };
}

/**
 * Returns list of available empty cell indices for given board
 */
export function getAvailableMoves(board: Board): number[] {
  const moves: number[] = [];
  board.forEach((cell, idx) => {
    if (cell === null) moves.push(idx);
  });
  return moves;
}
