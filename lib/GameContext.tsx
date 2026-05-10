import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Game, RoundScore } from "./types";
import {
  addRound,
  createGame,
} from "./gameLogic";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "./storage";
import {
  cancelGameReminder,
  scheduleGameReminder,
} from "./notifications";

interface GameContextValue {
  game: Game | null;
  startGame: (playerNames: string[], totalRounds: number) => Promise<void>;
  submitRound: (scores: RoundScore[]) => Promise<void>;
  undoLastRound: () => Promise<void>;
  finishGame: () => Promise<void>;
  abandonGame: () => Promise<void>;
  loading: boolean;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentGame()
      .then((saved) => {
        if (saved) setGame(saved);
      })
      .catch(() => {
        // storage unavailable — start fresh
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const startGame = useCallback(async (playerNames: string[], totalRounds: number) => {
    const newGame = createGame(playerNames, totalRounds);
    setGame(newGame);
    await saveCurrentGame(newGame);
    scheduleGameReminder();
  }, []);

  const submitRound = useCallback(
    async (scores: RoundScore[]) => {
      if (!game) return;
      const updated = addRound(game, scores);
      setGame(updated);
      await saveCurrentGame(updated);
    },
    [game]
  );

  const undoLastRound = useCallback(async () => {
    if (!game || game.rounds.length === 0) return;
    const updatedRounds = game.rounds.slice(0, -1);
    const updated: Game = {
      ...game,
      rounds: updatedRounds,
      currentRound: game.currentRound - 1,
      finishedAt: undefined,
    };
    setGame(updated);
    await saveCurrentGame(updated);
  }, [game]);

  const finishGame = useCallback(async () => {
    if (!game) return;
    const finished: Game = {
      ...game,
      currentRound: game.totalRounds + 1,
      finishedAt: new Date().toISOString(),
    };
    setGame(finished);
    await saveCurrentGame(finished);
    cancelGameReminder();
  }, [game]);

  const abandonGame = useCallback(async () => {
    setGame(null);
    await clearCurrentGame();
    cancelGameReminder();
  }, []);

  return (
    <GameContext.Provider value={{ game, startGame, submitRound, undoLastRound, finishGame, abandonGame, loading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
