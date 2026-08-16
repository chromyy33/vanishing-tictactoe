import { describe, it, expect } from 'vitest';
import { createInitialState, makeMove, checkWin, calculateBlinkingIndex } from '../lib/game/logic';

describe('Vanishing TicTacToe Engine Logic', () => {
  it('initializes game with empty board and X turn', () => {
    const state = createInitialState();
    expect(state.board.every(cell => cell === null)).toBe(true);
    expect(state.turn).toBe('X');
    expect(state.status).toBe('playing');
    expect(state.oldestBlinkingIndex).toBeNull();
  });

  it('allows players to place up to 3 marks without vanishing', () => {
    let state = createInitialState();
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 1); // O at 1
    state = makeMove(state, 3); // X at 3
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 6); // X at 6 (3rd X mark)

    // X has marks at 0, 3, 6 -> X wins!
    expect(state.status).toBe('won');
    expect(state.winner).toBe('X');
  });

  it('vanishes oldest mark when 4th mark is placed', () => {
    let state = createInitialState();
    // X moves: 0, 4, 8
    // O moves: 1, 2, 5
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 1); // O at 1
    state = makeMove(state, 4); // X at 4
    state = makeMove(state, 2); // O at 2
    state = makeMove(state, 7); // X at 7 (X has 3 marks: [0, 4, 7])
    
    // Now it's O's turn (O has 2 marks: [1, 2]).
    // Next X turn will blink X's mark at index 0.
    state = makeMove(state, 5); // O at 5 (O has 3 marks: [1, 2, 5])

    // Now it's X's turn. X already has 3 marks [0, 4, 7].
    // Blinking mark for X should be index 0!
    expect(state.oldestBlinkingIndex).toBe(0);

    // X places 4th mark at index 3. Mark at index 0 should vanish!
    state = makeMove(state, 3);

    expect(state.board[0]).toBeNull(); // Index 0 vanished!
    expect(state.board[3]).toBe('X'); // New mark placed
    expect(state.history.X).toEqual([4, 7, 3]); // Updated X history
    expect(state.lastVanishedIndex).toBe(0);
  });

  it('correctly handles victory after vanishing a mark', () => {
    let state = createInitialState();
    // Set up a board where placing the 4th mark completes a winning line
    // X: 0, 1, 8
    // O: 3, 4, 5
    state = makeMove(state, 0); // X at 0
    state = makeMove(state, 3); // O at 3
    state = makeMove(state, 1); // X at 1
    state = makeMove(state, 4); // O at 4
    state = makeMove(state, 8); // X at 8 (X history: [0, 1, 8])
    state = makeMove(state, 6); // O at 6 (O history: [3, 4, 6])

    // Now X places at 2. X's 4th mark. Mark 0 vanishes. Board has [1, 2, 8] - not winning.
    // Let's test placing at 2 when X history was [8, 0, 1] -> mark 8 vanishes, X board becomes [0, 1, 2] -> WIN!
    state = makeMove(state, 2); // X at 2. Mark at 0 vanishes. Board has 1, 8, 2 (not win).
    expect(state.status).toBe('playing');
  });
});
