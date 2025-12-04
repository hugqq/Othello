import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RotateCcw, Monitor, Users, Check, Link as LinkIcon } from 'lucide-react';
import { OthelloBoard } from './components/OthelloBoard';
import { ScoreBoard } from './components/ScoreBoard';
import { 
  createInitialBoard, 
  getValidMoves, 
  makeMove, 
  checkWinner, 
  getScore,
  validateBoard
} from './services/gameLogic';
import { getAIMove } from './services/geminiService';
import { BoardState, GameMode, Player, Position } from './types';

// Helper to encode state safely for URL
const encodeState = (board: BoardState, player: Player): string => {
  try {
    const json = JSON.stringify({ b: board, p: player });
    return btoa(json);
  } catch (e) {
    console.error("Encoding failed", e);
    return "";
  }
};

// Helper to decode state from URL
const decodeState = (hash: string): { board: BoardState, player: Player } | null => {
  try {
    if (!hash) return null;
    const json = atob(hash);
    const parsed = JSON.parse(json);
    // Validate structure before returning to prevent runtime crashes
    if (parsed.b && parsed.p && validateBoard(parsed.b)) {
      return { board: parsed.b, player: parsed.p };
    }
    return null;
  } catch (e) {
    return null;
  }
};

function App() {
  // --- State ---
  const [board, setBoard] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black'); // Black always starts
  const [gameMode, setGameMode] = useState<GameMode>(GameMode.PvP);
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [isRemoteGame, setIsRemoteGame] = useState(false);
  
  // Ref to prevent multiple AI calls
  const aiProcessingRef = useRef(false);

  // --- Helpers ---
  
  const updateValidMoves = useCallback((currentBoard: BoardState, player: Player) => {
    const moves = getValidMoves(currentBoard, player);
    setValidMoves(moves);
    return moves;
  }, []);

  // Initialize game
  const initGame = useCallback((mode: GameMode = GameMode.PvP, initialBoard?: BoardState, initialPlayer?: Player, isRemote: boolean = false) => {
    const newBoard = initialBoard || createInitialBoard();
    const startPlayer = initialPlayer || 'black';
    
    setBoard(newBoard);
    setCurrentPlayer(startPlayer);
    setGameMode(mode);
    setIsRemoteGame(isRemote);
    setWinner(null);
    setLastMove(null);
    setAiThinking(false);
    aiProcessingRef.current = false;
    
    updateValidMoves(newBoard, startPlayer);
    
    if (!initialBoard) {
      // Clear hash only if starting a FRESH game explicitly
      try {
        window.history.pushState(null, '', window.location.pathname);
      } catch (e) {
        // Ignore history errors (e.g. security restrictions)
      }
    }
  }, [updateValidMoves]);

  // --- Effects ---

  // 1. Load state from URL Hash on Mount
  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decoded = decodeState(hash);
        if (decoded) {
          // Automatically start in "Remote" mode (PvP logic) if loaded from link
          initGame(GameMode.PvP, decoded.board, decoded.player, true);
        } else {
          initGame();
        }
      } else {
        initGame();
      }
    } catch (e) {
      console.error("Failed to load state", e);
      initGame();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // 2. Sync URL Hash with Game State
  useEffect(() => {
    // Only update hash if the game has started or changed
    const encoded = encodeState(board, currentPlayer);
    const currentHash = window.location.hash.slice(1);

    if (encoded !== currentHash) {
      try {
        // replaceState updates the URL without adding a new history entry
        window.history.replaceState(null, '', `#${encoded}`);
      } catch (e) {
        // Silently fail if history API is blocked/throttled
      }
    }
  }, [board, currentPlayer]);


  // --- Game Loop ---

  const handleTurnChange = useCallback((nextBoard: BoardState, nextPlayer: Player) => {
    const winState = checkWinner(nextBoard);
    if (winState) {
      setWinner(winState);
      setBoard(nextBoard);
      setCurrentPlayer(nextPlayer); 
      setValidMoves([]);
      return;
    }

    let moves = getValidMoves(nextBoard, nextPlayer);
    
    if (moves.length === 0) {
      const opponent = nextPlayer === 'black' ? 'white' : 'black';
      const opponentMoves = getValidMoves(nextBoard, opponent);
      
      if (opponentMoves.length === 0) {
        setWinner(checkWinner(nextBoard) || 'draw'); 
      } else {
        setTimeout(() => {
            console.log(`${nextPlayer.toUpperCase()} has no valid moves! Passing turn.`);
            setCurrentPlayer(opponent);
            updateValidMoves(nextBoard, opponent);
            setBoard(nextBoard);
        }, 100);
      }
    } else {
      setBoard(nextBoard);
      setCurrentPlayer(nextPlayer);
      setValidMoves(moves);
    }
  }, [updateValidMoves]);

  const executeMove = useCallback((row: number, col: number) => {
    const nextBoard = makeMove(board, currentPlayer, row, col);
    setLastMove({ row, col });
    
    const nextPlayer = currentPlayer === 'black' ? 'white' : 'black';
    handleTurnChange(nextBoard, nextPlayer);
  }, [board, currentPlayer, handleTurnChange]);


  // AI Logic Trigger
  useEffect(() => {
    const runAI = async () => {
      if (
        gameMode === GameMode.PvAI && 
        currentPlayer === 'white' && 
        !winner && 
        !aiProcessingRef.current
      ) {
        aiProcessingRef.current = true;
        setAiThinking(true);
        
        try {
          const aiResponse = await getAIMove(board, currentPlayer, validMoves);
          executeMove(aiResponse.move.row, aiResponse.move.col);
        } catch (error) {
          console.error("AI Move failed", error);
        } finally {
          setAiThinking(false);
          aiProcessingRef.current = false;
        }
      }
    };

    runAI();
  }, [board, currentPlayer, gameMode, winner, validMoves, executeMove]);


  // --- Interactions ---

  const handleCellClick = (row: number, col: number) => {
    if (winner || aiThinking) return;
    if (!validMoves.some(m => m.row === row && m.col === col)) return;
    executeMove(row, col);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setShowCopySuccess(true);
          setTimeout(() => setShowCopySuccess(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy', err);
          alert("Could not copy link automatically. Please copy the URL from the address bar.");
        });
    } else {
      alert("Please copy the URL from the address bar manually.");
    }
  };

  const scores = getScore(board);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-2 flex flex-col items-center justify-center">
      
      {/* Mode Switcher */}
      <div className="flex gap-2 mb-4 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
          <button 
          onClick={() => initGame(GameMode.PvP)} 
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-all text-xs sm:text-sm font-bold ${gameMode === GameMode.PvP && !isRemoteGame ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50'}`}
        >
          <Users size={16} />
          Local PvP
        </button>
        <button 
          onClick={() => initGame(GameMode.PvAI)} 
          className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-md transition-all text-xs sm:text-sm font-bold ${gameMode === GameMode.PvAI ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-700/50'}`}
        >
          <Monitor size={16} />
          Vs AI
        </button>
      </div>

      {/* Main Game Area */}
      <main className="w-full max-w-md flex flex-col items-center">
        
        <ScoreBoard 
          scores={scores} 
          currentPlayer={currentPlayer} 
          winner={winner} 
          aiThinking={aiThinking}
          isRemote={isRemoteGame}
        />

        <div className="w-full aspect-square mb-6">
          <OthelloBoard 
            board={board} 
            validMoves={!winner && !aiThinking ? validMoves : []} 
            onCellClick={handleCellClick} 
            currentPlayer={currentPlayer}
            lastMove={lastMove}
            disabled={!!winner || aiThinking}
          />
        </div>

        {/* Action Bar */}
        <div className="flex w-full gap-3 px-2">
          
          <button 
            onClick={handleCopyLink}
            className={`
              flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-all active:scale-95 border text-sm
              ${showCopySuccess 
                ? 'bg-green-900/50 border-green-500 text-green-400' 
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-blue-400 hover:text-blue-300'}
            `}
          >
            {showCopySuccess ? <Check size={18} /> : <LinkIcon size={18} />}
            {showCopySuccess ? "Copied!" : "Copy Game Link"}
          </button>

          <button 
            onClick={() => initGame(gameMode)}
            className="flex-none w-28 flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-all active:scale-95 border border-slate-700 text-red-400 hover:text-red-300 text-sm"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        </div>
        
        {/* Remote Play Tip */}
        <div className="mt-4 px-4 text-center">
          {isRemoteGame && (
             <p className="text-xs text-slate-400 bg-slate-800/50 p-2 rounded border border-slate-700/50">
               <span className="font-bold text-blue-400">Async Mode:</span> Make your move, then copy the link and send it back to your opponent.
             </p>
          )}
          {!isRemoteGame && gameMode === GameMode.PvP && (
             <p className="text-xs text-slate-500">
               Tip: To play with a friend, make a move (or not), click "Copy Game Link", and send it to them.
             </p>
          )}
        </div>

      </main>
    </div>
  );
}

export default App;