export type Player = 'black' | 'white';
export type CellState = Player | null;
export type BoardState = CellState[][];

export interface Position {
  row: number;
  col: number;
}

export interface Move extends Position {
  player: Player;
}

export enum GameMode {
  PvP = 'PvP', // Local Player vs Player
  PvAI = 'PvAI', // Player vs Gemini
  Remote = 'Remote' // Async Remote Play (Shared State)
}

export interface GameState {
  board: BoardState;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  history: BoardState[]; // For undo functionality
  validMoves: Position[];
  isThinking: boolean; // AI thinking state
  lastMove: Position | null;
}

export interface AIResponse {
  move: Position;
  reasoning: string;
}
