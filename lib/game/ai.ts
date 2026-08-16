import { GameState, Player, AIDifficulty } from './types';
import { getAvailableMoves, makeMove, checkWin } from './logic';

export function getAIMove(state: GameState, difficulty: AIDifficulty): number {
  const availableMoves = getAvailableMoves(state.board);
  if (availableMoves.length === 0) return -1;

  if (difficulty === 'easy') {
    return getEasyMove(availableMoves);
  } else if (difficulty === 'medium') {
    return getMediumMove(state, availableMoves);
  } else {
    return getHardMove(state, availableMoves);
  }
}

function getEasyMove(availableMoves: number[]): number {
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

function getMediumMove(state: GameState, availableMoves: number[]): number {
  const aiPlayer = state.turn;
  const opponentPlayer: Player = aiPlayer === 'X' ? 'O' : 'X';

  // 1. Can AI win in 1 move?
  for (const move of availableMoves) {
    const nextState = makeMove(state, move);
    if (nextState.status === 'won' && nextState.winner === aiPlayer) {
      return move;
    }
  }

  // 2. Can opponent win on their next turn if we don't block?
  // Simulate opponent's hypothetical immediate win
  for (const move of availableMoves) {
    // If AI does not take this move, could opponent take it and win?
    const hypotheticalState: GameState = {
      ...state,
      turn: opponentPlayer
    };
    const nextState = makeMove(hypotheticalState, move);
    if (nextState.status === 'won' && nextState.winner === opponentPlayer) {
      return move; // Block opponent!
    }
  }

  // 3. Prefer center if available
  if (availableMoves.includes(4)) {
    return 4;
  }

  // 4. Prefer corners
  const corners = [0, 2, 6, 8].filter(c => availableMoves.includes(c));
  if (corners.length > 0) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // 5. Fallback to random
  return getEasyMove(availableMoves);
}

/**
 * Hard AI: Minimax algorithm with depth limit & dynamic board state evaluation.
 */
function getHardMove(state: GameState, availableMoves: number[]): number {
  const aiPlayer = state.turn;

  // First check if there's an immediate winning move to save computation
  for (const move of availableMoves) {
    const nextState = makeMove(state, move);
    if (nextState.status === 'won' && nextState.winner === aiPlayer) {
      return move;
    }
  }

  let bestScore = -Infinity;
  let bestMove = availableMoves[0];
  const maxDepth = 6; // Depth limit for fast and deep computation

  for (const move of availableMoves) {
    const nextState = makeMove(state, move);
    const score = minimax(nextState, 0, false, aiPlayer, -Infinity, Infinity, maxDepth);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

function minimax(
  state: GameState,
  depth: number,
  isMaximizing: boolean,
  aiPlayer: Player,
  alpha: number,
  beta: number,
  maxDepth: number
): number {
  // Terminal state evaluation
  if (state.status === 'won') {
    if (state.winner === aiPlayer) {
      return 1000 - depth;
    } else {
      return -1000 + depth;
    }
  }

  if (depth >= maxDepth) {
    return evaluateBoard(state, aiPlayer);
  }

  const availableMoves = getAvailableMoves(state.board);
  if (availableMoves.length === 0) return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of availableMoves) {
      const nextState = makeMove(state, move);
      const evalScore = minimax(nextState, depth + 1, false, aiPlayer, alpha, beta, maxDepth);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of availableMoves) {
      const nextState = makeMove(state, move);
      const evalScore = minimax(nextState, depth + 1, true, aiPlayer, alpha, beta, maxDepth);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha-beta pruning
    }
    return minEval;
  }
}

/**
 * Heuristic evaluation of vanishing board for depth-limited Minimax
 */
function evaluateBoard(state: GameState, aiPlayer: Player): number {
  const opponent: Player = aiPlayer === 'X' ? 'O' : 'X';
  let score = 0;

  // Value center control
  if (state.board[4] === aiPlayer) score += 3;
  if (state.board[4] === opponent) score -= 3;

  // Value marks count and position
  state.history[aiPlayer].forEach((idx, order) => {
    // Newer marks are slightly more valuable since they won't vanish immediately
    score += (order + 1) * 2;
  });

  state.history[opponent].forEach((idx, order) => {
    score -= (order + 1) * 2;
  });

  return score;
}
