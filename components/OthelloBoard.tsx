import React from 'react';
import { BoardState, CellState, Player, Position } from '../types';
import { BOARD_SIZE } from '../constants';

interface OthelloBoardProps {
  board: BoardState;
  validMoves: Position[];
  onCellClick: (row: number, col: number) => void;
  currentPlayer: Player;
  lastMove: Position | null;
  disabled: boolean;
}

const Cell = ({ 
  state, 
  isValid, 
  isLastMove,
  onClick, 
  disabled,
  currentPlayer
}: { 
  state: CellState, 
  isValid: boolean, 
  isLastMove: boolean,
  onClick: () => void, 
  disabled: boolean,
  currentPlayer: Player
}) => {
  return (
    <div 
      onClick={!disabled && isValid ? onClick : undefined}
      className={`
        relative w-full aspect-square rounded-sm sm:rounded-md flex items-center justify-center
        ${(isValid && !disabled) ? 'cursor-pointer' : ''}
        bg-green-800 border border-green-900/30
      `}
    >
      {/* Valid Move Marker (Ghost Disc) */}
      {isValid && !state && !disabled && (
        <div 
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[90%] aspect-square rounded-full 
            ${currentPlayer === 'black' ? 'bg-black/40' : 'bg-white/40'}
            pointer-events-none z-10
          `} 
        />
      )}

      {/* Disc */}
      <div 
        className={`
          w-[90%] aspect-square rounded-full shadow-lg transition-all duration-500 transform
          ${state === 'black' ? 'bg-slate-900 rotate-y-0' : ''}
          ${state === 'white' ? 'bg-slate-100 rotate-y-180' : ''}
          ${!state ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
          ${isLastMove ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-green-800' : ''}
          flex items-center justify-center
        `}
        style={{
          boxShadow: state 
            ? 'inset 2px 2px 4px rgba(255,255,255,0.3), inset -2px -2px 4px rgba(0,0,0,0.4), 2px 4px 6px rgba(0,0,0,0.5)'
            : 'none'
        }}
      >
          {/* Inner highlight for 3D effect */}
          {state && (
             <div className={`w-full h-full rounded-full opacity-20 bg-gradient-to-br from-white to-transparent`} />
          )}
      </div>
    </div>
  );
};

export const OthelloBoard: React.FC<OthelloBoardProps> = ({ 
  board, 
  validMoves, 
  onCellClick, 
  lastMove,
  disabled,
  currentPlayer
}) => {
  return (
    <div className="relative p-1 sm:p-2 bg-green-900 rounded-lg shadow-2xl border-4 border-green-950">
      {/* Grid Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none rounded-lg" />
      
      <div 
        className="grid gap-0.5 sm:gap-1 relative z-10"
        style={{ gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))` }}
      >
        {board.map((row, r) => (
          row.map((cell, c) => {
            const isValid = validMoves.some(m => m.row === r && m.col === c);
            const isLast = lastMove?.row === r && lastMove?.col === c;
            
            return (
              <Cell 
                key={`${r}-${c}`}
                state={cell}
                isValid={isValid}
                isLastMove={isLast}
                onClick={() => onCellClick(r, c)}
                disabled={disabled}
                currentPlayer={currentPlayer}
              />
            );
          })
        ))}
      </div>
    </div>
  );
};