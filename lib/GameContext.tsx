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
  TOTAL_ROUNDS,
} from "./gameLogic";
import {
  clearCurrentGame,
  loadCurrentGame,
  saveCurrentGame,
} from "./storage";

interface GameContextValue {
  game: Game | null;
  startGame: (playerNames: string[]) => Promise<void>;
  submitRound: (scores: RoundScore[]) => Promise<void>;
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

  const startGame = useCallback(async (playerNames: string[]) => {
    const newGame = createGame(playerNames);
    setGame(newGame);
    await saveCurrentGame(newGame);
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

  const finishGame = useCallback(async () => {
    if (!game) return;
    const finished: Game = {
      ...game,
      currentRound: TOTAL_ROUNDS + 1,
      finishedAt: new Date().toISOString(),
    };
    setGame(finished);
    await saveCurrentGame(finished);
  }, [game]);

  const abandonGame = useCallback(async () => {
    setGame(null);
    await clearCurrentGame();
  }, []);

  return (
    <GameContext.Provider value={{ game, startGame, submitRound, finishGame, abandonGame, loading }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
