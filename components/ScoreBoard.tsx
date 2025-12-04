import React from 'react';
import { Player } from '../types';
import { Globe } from 'lucide-react';

interface ScoreBoardProps {
  scores: { black: number, white: number };
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  aiThinking: boolean;
  isRemote?: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ 
  scores, 
  currentPlayer, 
  winner, 
  aiThinking,
  isRemote
}) => {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md mx-auto mb-4">
      <div className="flex items-center justify-between bg-slate-800 rounded-xl p-3 shadow-lg border border-slate-700 relative overflow-hidden">
        
        {/* Remote Badge */}
        {isRemote && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-900/80 text-blue-200 text-[10px] uppercase font-bold px-2 py-0.5 rounded-b-md flex items-center gap-1 border border-t-0 border-blue-700/50">
            <Globe size={10} /> Async Match
          </div>
        )}

        {/* Black Player */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === 'black' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-900 rounded-full border-2 border-slate-600 shadow-inner flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-white">{scores.black}</span>
            </div>
            {currentPlayer === 'black' && !winner && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-bounce" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold mt-1 text-slate-300">Black</span>
        </div>

        {/* Status Text */}
        <div className="text-center px-2 pt-2">
          {winner ? (
            <div className="text-lg sm:text-xl font-bold text-yellow-400 animate-pulse whitespace-nowrap">
              {winner === 'draw' ? "Draw!" : `${winner === 'black' ? 'Black' : 'White'} Wins!`}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <span className={`text-base sm:text-lg font-bold ${currentPlayer === 'black' ? 'text-slate-300' : 'text-white'}`}>
                {aiThinking ? (
                   <span className="flex items-center gap-1 text-blue-400">
                     Thinking...
                   </span>
                ) : (
                  currentPlayer === 'black' ? "Black's Turn" : "White's Turn"
                )}
              </span>
            </div>
          )}
        </div>

        {/* White Player */}
        <div className={`flex flex-col items-center transition-opacity duration-300 ${currentPlayer === 'white' ? 'opacity-100 scale-105' : 'opacity-60'}`}>
           <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-full border-2 border-slate-300 shadow-inner flex items-center justify-center">
              <span className="text-lg sm:text-xl font-bold text-slate-900">{scores.white}</span>
            </div>
            {currentPlayer === 'white' && !winner && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-800 animate-bounce" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-semibold mt-1 text-slate-300">White</span>
        </div>
      </div>
    </div>
  );
};