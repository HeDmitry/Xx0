import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Trophy, Flame } from 'lucide-react';
import { soundEngine } from './AudioEngine';
import { Confetti } from './Confetti';

export type PlayerSymbol = 'X' | 'O';
export type BoardState = (PlayerSymbol | null)[];

const WIN_COMBINATIONS = [
  [0, 1, 2], // Row 0
  [3, 4, 5], // Row 1
  [6, 7, 8], // Row 2
  [0, 3, 6], // Col 0
  [1, 4, 7], // Col 1
  [2, 5, 8], // Col 2
  [0, 4, 8], // Diag 1
  [2, 4, 6], // Diag 2
];

interface TicTacToeGameProps {
  isPhoneFrame?: boolean;
}

export const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ isPhoneFrame = false }) => {
  const [board, setBoard] = useState<BoardState>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerSymbol>('X');
  const [roundStarter, setRoundStarter] = useState<PlayerSymbol>('X');
  const [round, setRound] = useState<number>(1);
  const [scoreX, setScoreX] = useState<number>(0);
  const [scoreO, setScoreO] = useState<number>(0);
  const [scoreDraws, setScoreDraws] = useState<number>(0);
  const [winner, setWinner] = useState<PlayerSymbol | 'DRAW' | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [streakPlayer, setStreakPlayer] = useState<PlayerSymbol | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundEngine.enabled = next;
    if (next) soundEngine.playClick();
  };

  const handleCellClick = (index: number) => {
    // If cell occupied or game already concluded, do nothing
    if (board[index] !== null || winner !== null) return;

    // Play move sound
    if (currentPlayer === 'X') {
      soundEngine.playXMove();
    } else {
      soundEngine.playOMove();
    }

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    setBoard(nextBoard);

    // Check for win
    let foundWin = false;
    for (const combo of WIN_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        nextBoard[a] &&
        nextBoard[a] === nextBoard[b] &&
        nextBoard[a] === nextBoard[c]
      ) {
        foundWin = true;
        setWinner(currentPlayer);
        setWinningLine(combo);
        soundEngine.playWin();

        if (currentPlayer === 'X') {
          setScoreX((prev) => prev + 1);
        } else {
          setScoreO((prev) => prev + 1);
        }

        // Streak update
        if (streakPlayer === currentPlayer) {
          setStreakCount((prev) => prev + 1);
        } else {
          setStreakPlayer(currentPlayer);
          setStreakCount(1);
        }
        break;
      }
    }

    if (foundWin) return;

    // Check for draw
    if (!nextBoard.includes(null)) {
      setWinner('DRAW');
      setScoreDraws((prev) => prev + 1);
      soundEngine.playDraw();
      setStreakCount(0);
      setStreakPlayer(null);
      return;
    }

    // Pass turn to other player
    setCurrentPlayer((prev) => (prev === 'X' ? 'O' : 'X'));
  };

  const nextRound = () => {
    soundEngine.playClick();
    const nextStarter = roundStarter === 'X' ? 'O' : 'X';
    setRoundStarter(nextStarter);
    setCurrentPlayer(nextStarter);
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setRound((prev) => prev + 1);
  };

  const resetAllScores = () => {
    soundEngine.playClick();
    setScoreX(0);
    setScoreO(0);
    setScoreDraws(0);
    setRound(1);
    setRoundStarter('X');
    setCurrentPlayer('X');
    setBoard(Array(9).fill(null));
    setWinner(null);
    setWinningLine(null);
    setStreakCount(0);
    setStreakPlayer(null);
  };

  return (
    <div className={`relative flex flex-col justify-between ${isPhoneFrame ? 'w-full max-w-[390px] h-[680px] p-5' : 'w-full max-w-[480px] min-h-[640px] p-6'} mx-auto bg-slate-950/95 text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl shadow-cyan-950/20 select-none overflow-hidden`}>
      {/* Background ambient neon glow */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-rose-500/10 blur-3xl" />

      {/* Confetti celebration on win */}
      {winner && winner !== 'DRAW' && <Confetti winnerSymbol={winner} />}

      {/* 1. Header: Title, Round & Audio toggle */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-800/60 pb-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            Крестики-Нолики
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Режим Hotseat</span>
            <span aria-hidden="true">·</span>
            <span>Раунд {round}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {streakCount >= 2 && streakPlayer && (
            <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>{streakPlayer}: {streakCount} в ряд!</span>
            </div>
          )}
          <button
            onClick={toggleSound}
            aria-label="Включить / выключить звук"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* 2. Scoreboard: Player 1 (X) vs Draws vs Player 2 (O) */}
      <div className="relative z-10 grid grid-cols-3 gap-2.5 my-3 bg-slate-900/90 border border-slate-800/80 p-3 rounded-2xl">
        {/* Player 1 (X) */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${currentPlayer === 'X' && !winner ? 'bg-cyan-950/40 border border-cyan-500/40 shadow-sm shadow-cyan-500/20' : 'bg-slate-950/50 border border-transparent'}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Игрок 1 (X)</span>
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {scoreX}
          </span>
        </div>

        {/* Draws */}
        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-950/50 border border-slate-800/40">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ничьи</span>
          <span className="text-xl font-bold font-mono tabular-nums text-slate-300 mt-1">
            {scoreDraws}
          </span>
        </div>

        {/* Player 2 (O) */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${currentPlayer === 'O' && !winner ? 'bg-rose-950/40 border border-rose-500/40 shadow-sm shadow-rose-500/20' : 'bg-slate-950/50 border border-transparent'}`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Игрок 2 (O)</span>
          </div>
          <span className="text-2xl font-bold font-mono tabular-nums text-white mt-1">
            {scoreO}
          </span>
        </div>
      </div>

      {/* 3. Turn Status Indicator */}
      <div className="relative z-10 flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800/60 text-sm">
        {winner === null ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Очередь хода:</span>
            {currentPlayer === 'X' ? (
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                Игрок 1 (X)
              </span>
            ) : (
              <span className="font-bold text-rose-400 flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Игрок 2 (O)
              </span>
            )}
          </div>
        ) : winner === 'DRAW' ? (
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Боевая ничья!
          </span>
        ) : (
          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            Победитель: {winner === 'X' ? 'Игрок 1 (X)' : 'Игрок 2 (O)'}
          </span>
        )}
      </div>

      {/* 4. 3x3 Grid Field */}
      <div className="relative z-10 my-auto flex items-center justify-center py-2">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[340px] aspect-square p-2 bg-slate-900/80 rounded-2xl border border-slate-800/80">
          {board.map((cell, idx) => {
            const isWinningCell = winningLine?.includes(idx);
            return (
              <button
                key={idx}
                onClick={() => handleCellClick(idx)}
                disabled={cell !== null || winner !== null}
                className={`relative flex items-center justify-center rounded-xl font-bold text-4xl sm:text-5xl transition-all duration-200 select-none ${
                  cell === null && !winner
                    ? 'bg-slate-950/70 border border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700 cursor-pointer active:scale-95'
                    : 'cursor-default'
                } ${
                  isWinningCell
                    ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-lg shadow-emerald-500/25 scale-[1.03]'
                    : cell !== null
                    ? 'bg-slate-950/90 border border-slate-800'
                    : ''
                }`}
                style={{ minHeight: '84px' }}
              >
                {/* Visual marker rendering with Motion */}
                <AnimatePresence>
                  {cell === 'X' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                    >
                      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none">
                        <line x1="12" y1="12" x2="36" y2="36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                        <line x1="36" y1="12" x2="12" y2="36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                  {cell === 'O' && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                      className="text-rose-500 drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                    >
                      <svg className="w-11 h-11" viewBox="0 0 48 48" fill="none">
                        <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Bottom Controls: Rematch & Reset Score */}
      <div className="relative z-10 flex items-center gap-3 pt-3 border-t border-slate-800/60">
        <button
          onClick={nextRound}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:border-slate-600 text-white font-semibold text-sm transition-all active:scale-98 shadow-sm cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" />
          <span>Новая игра</span>
        </button>

        <button
          onClick={resetAllScores}
          className="py-3 px-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-900/60 hover:text-rose-300 text-slate-400 text-xs font-medium transition-colors cursor-pointer"
        >
          Сброс счёта
        </button>
      </div>

      {/* 6. Victory / Draw Overlay Modal */}
      <AnimatePresence>
        {winner && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.85, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className={`w-full max-w-sm rounded-2xl p-6 text-center border shadow-2xl ${
                winner === 'X'
                  ? 'bg-slate-900/95 border-cyan-500/40 shadow-cyan-500/20'
                  : winner === 'O'
                  ? 'bg-slate-900/95 border-rose-500/40 shadow-rose-500/20'
                  : 'bg-slate-900/95 border-slate-700/50 shadow-slate-900/50'
              }`}
            >
              {/* Winner Icon */}
              <div className="flex justify-center mb-3">
                {winner === 'X' ? (
                  <div className="w-16 h-16 rounded-2xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/30">
                    <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
                      <line x1="12" y1="12" x2="36" y2="36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                      <line x1="36" y1="12" x2="12" y2="36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : winner === 'O' ? (
                  <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-lg shadow-rose-500/30">
                    <svg className="w-9 h-9" viewBox="0 0 48 48" fill="none">
                      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                )}
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
                {winner === 'X' ? 'ПОБЕДА Х!' : winner === 'O' ? 'ПОБЕДА O!' : 'НИЧЬЯ!'}
              </h3>
              <p className="text-sm text-slate-400 mb-6">
                {winner === 'X'
                  ? 'Игрок 1 (Крестики) празднует триумф!'
                  : winner === 'O'
                  ? 'Игрок 2 (Нолики) оказался точнее!'
                  : 'Поле заполнено, оба игрока сыграли безупречно!'}
              </p>

              {/* Rematch action */}
              <button
                onClick={nextRound}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md active:scale-98 cursor-pointer ${
                  winner === 'X'
                    ? 'bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-cyan-500/30'
                    : winner === 'O'
                    ? 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/30'
                    : 'bg-slate-100 hover:bg-white text-slate-900 shadow-white/20'
                }`}
              >
                СЛЕДУЮЩИЙ РАУНД
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
