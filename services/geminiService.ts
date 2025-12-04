import { BoardState, Player, Position, AIResponse } from '../types';
import { makeMove } from './gameLogic';
import { BOARD_SIZE } from '../constants';

// Weight matrix for position evaluation
// Corners are high value (100), adjacent to corners are dangerous (-20/-50)
const WEIGHTS = [
  [100, -20, 10,  5,  5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [ 10,  -2, -1, -1, -1, -1,  -2,  10],
  [  5,  -2, -1, -1, -1, -1,  -2,   5],
  [  5,  -2, -1, -1, -1, -1,  -2,   5],
  [ 10,  -2, -1, -1, -1, -1,  -2,  10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10,  5,  5, 10, -20, 100],
];

const evaluateBoard = (board: BoardState, player: Player): number => {
    let score = 0;
    const opponent = player === 'black' ? 'white' : 'black';
    
    for(let r=0; r<BOARD_SIZE; r++) {
        for(let c=0; c<BOARD_SIZE; c++) {
            const val = board[r][c];
            if (val === player) score += WEIGHTS[r][c];
            else if (val === opponent) score -= WEIGHTS[r][c];
        }
    }
    return score;
};

export const getAIMove = async (
  board: BoardState,
  player: Player,
  validMoves: Position[]
): Promise<AIResponse> => {
  // Use a small delay to mimic "thinking" so it's not jarringly instant
  await new Promise(resolve => setTimeout(resolve, 600));

  if (validMoves.length === 0) {
    throw new Error("No valid moves available for AI.");
  }

  // Fallback if something is wrong
  if (validMoves.length === 1) {
    return {
      move: validMoves[0],
      reasoning: "Only one legal move."
    };
  }

  let bestScore = -Infinity;
  let bestMove = validMoves[0];

  // Evaluate each valid move
  for (const move of validMoves) {
    // Speculatively make the move
    const nextBoard = makeMove(board, player, move.row, move.col);
    
    // Static evaluation of the resulting board
    // A deeper search (Minimax) could be added here, but static weights 
    // are surprisingly effective for a fast mobile experience.
    const score = evaluateBoard(nextBoard, player);

    // Add a tiny random jitter to break ties and make AI feel less robotic
    const jitter = Math.random() * 0.5;

    if (score + jitter > bestScore) {
      bestScore = score + jitter;
      bestMove = move;
    }
  }

  return {
    move: bestMove,
    reasoning: "Local AI calculation"
  };
};