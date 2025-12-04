import { BOARD_SIZE, DIRECTIONS, INITIAL_BOARD } from '../constants';
import { BoardState, CellState, Player, Position } from '../types';

export const createInitialBoard = (): BoardState => {
  // Deep copy initial board
  return JSON.parse(JSON.stringify(INITIAL_BOARD));
};

export const isValidPos = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const validateBoard = (board: any): boolean => {
  if (!Array.isArray(board) || board.length !== BOARD_SIZE) return false;
  return board.every(row => Array.isArray(row) && row.length === BOARD_SIZE);
};

export const getOpponent = (player: Player): Player => {
  return player === 'black' ? 'white' : 'black';
};

export const calculateFlips = (board: BoardState, player: Player, row: number, col: number): Position[] => {
  const flips: Position[] = [];
  const opponent = getOpponent(player);

  // Safety check to prevent crash if indices are somehow out of bounds during calculation
  if (!isValidPos(row, col)) return [];
  if (board[row][col] !== null) return []; // Cell must be empty

  for (const [dr, dc] of DIRECTIONS) {
    let r = row + dr;
    let c = col + dc;
    const currentDirectionFlips: Position[] = [];

    // Move in direction as long as we see opponent pieces
    while (isValidPos(r, c) && board[r][c] === opponent) {
      currentDirectionFlips.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // If we stopped at a cell of our own color, and we flipped at least one opponent, it's valid
    if (isValidPos(r, c) && board[r][c] === player && currentDirectionFlips.length > 0) {
      flips.push(...currentDirectionFlips);
    }
  }

  return flips;
};

export const getValidMoves = (board: BoardState, player: Player): Position[] => {
  const moves: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (calculateFlips(board, player, r, c).length > 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
};

export const makeMove = (board: BoardState, player: Player, row: number, col: number): BoardState => {
  const flips = calculateFlips(board, player, row, col);
  if (flips.length === 0) return board; // Should not happen if move is validated before calling

  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = player;
  
  flips.forEach(pos => {
    newBoard[pos.row][pos.col] = player;
  });

  return newBoard;
};

export const getScore = (board: BoardState) => {
  let black = 0;
  let white = 0;
  board.forEach(row => {
    row.forEach(cell => {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
    });
  });
  return { black, white };
};

export const checkWinner = (board: BoardState): Player | 'draw' | null => {
  const { black, white } = getScore(board);
  const total = black + white;
  
  // Game ends if board is full or neither player can move
  const blackMoves = getValidMoves(board, 'black');
  const whiteMoves = getValidMoves(board, 'white');

  if (total === BOARD_SIZE * BOARD_SIZE || (blackMoves.length === 0 && whiteMoves.length === 0)) {
    if (black > white) return 'black';
    if (white > black) return 'white';
    return 'draw';
  }
  
  return null; // Game continues
};