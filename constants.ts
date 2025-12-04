import { BoardState } from './types';

export const BOARD_SIZE = 8;

export const INITIAL_BOARD: BoardState = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));

// Standard Othello setup
INITIAL_BOARD[3][3] = 'white';
INITIAL_BOARD[3][4] = 'black';
INITIAL_BOARD[4][3] = 'black';
INITIAL_BOARD[4][4] = 'white';

export const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1]
];

export const SYSTEM_INSTRUCTION = `You are a Grandmaster Othello (Reversi) player. 
Your goal is to win by having the most discs of your color on the board at the end.
Analyze the board carefully. Prioritize corners (stable discs) and edges. Avoid placing discs adjacent to corners (C-squares and X-squares) unless necessary.
Limit the opponent's mobility.
You will be provided with the current board state and a list of valid moves.
You MUST pick one move from the provided valid moves list.
Return the response in strictly valid JSON format matching the schema.`;
