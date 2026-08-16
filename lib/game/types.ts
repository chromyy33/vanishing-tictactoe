export type Player = 'X' | 'O';
export type CellState = Player | null;
export type Board = CellState[];

export type GameMode = 'pass-and-play' | 'ai' | 'online';
export type AIDifficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';

export interface MoveRecord {
  player: Player;
  placedIndex: number;
  vanishedIndex: number | null;
  timestamp: number;
}

export interface GameState {
  board: Board;
  history: Record<Player, number[]>; // Array of cell indices placed by X and O (max length 3)
  turn: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: [number, number, number] | null;
  oldestBlinkingIndex: number | null; // Cell index of mark that blinks on current turn
  lastVanishedIndex: number | null;   // Cell index that just vanished on last move (for animations)
  moveCount: number;
  mode: GameMode;
  aiDifficulty: AIDifficulty;
  myPlayerSymbol?: Player; // For online mode
}

export interface ScoreState {
  xWins: number;
  oWins: number;
  ties: number;
}

export const WINNING_COMBINATIONS: [number, number, number][] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6]              // Diagonals
];
