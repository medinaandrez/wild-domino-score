import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  saveFrequentPlayers,
} from "./storage";
import {
  cancelGameReminder,
  scheduleGameReminder,
} from "./notifications";
import { updateWidget } from "./widgetData";
import { endLiveActivity, startLiveActivity, updateLiveActivity } from "./liveActivity";

interface GameContextValue {
  game: Game | null;
  startGame: (playerNames: string[], totalRounds: number) => Promise<void>;
  submitRound: (scores: RoundScore[]) => Promise<void>;
  undoLastRound: () => Promise<void>;
  editRoundScore: (roundNumber: number, playerId: string, points: number) => Promise<void>;
  editPlayerName: (playerId: string, newName: string) => Promise<void>;
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
        updateWidget(saved ?? null);
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
    saveFrequentPlayers(playerNames);
    updateWidget(newGame);
    startLiveActivity(newGame);
    scheduleGameReminder();
  }, []);

  const submitRound = useCallback(
    async (scores: RoundScore[]) => {
      if (!game) return;
      const updated = addRound(game, scores);
      setGame(updated);
      await saveCurrentGame(updated);
      updateWidget(updated);
      updateLiveActivity(updated);
    },
    [game]
  );

  const editRoundScore = useCallback(async (roundNumber: number, playerId: string, points: number) => {
    if (!game) return;
    const updatedRounds = game.rounds.map((round) => {
      if (round.roundNumber !== roundNumber) return round;
      return {
        ...round,
        scores: round.scores.map((s) =>
          s.playerId === playerId ? { ...s, points } : s
        ),
      };
    });
    const updated = { ...game, rounds: updatedRounds };
    setGame(updated);
    await saveCurrentGame(updated);
    updateWidget(updated);
    updateLiveActivity(updated);
  }, [game]);

  const editPlayerName = useCallback(async (playerId: string, newName: string) => {
    if (!game) return;
    const updated: Game = {
      ...game,
      players: game.players.map((p) =>
        p.id === playerId ? { ...p, name: newName.trim() } : p
      ),
    };
    setGame(updated);
    await saveCurrentGame(updated);
    updateWidget(updated);
    updateLiveActivity(updated);
  }, [game]);

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
    updateWidget(updated);
    updateLiveActivity(updated);
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
    updateWidget(finished);
    updateLiveActivity(finished, true);
    cancelGameReminder();
  }, [game]);

  const abandonGame = useCallback(async () => {
    setGame(null);
    await clearCurrentGame();
    updateWidget(null);
    endLiveActivity();
    cancelGameReminder();
  }, []);

  const value = useMemo(
    () => ({ game, startGame, submitRound, undoLastRound, editRoundScore, editPlayerName, finishGame, abandonGame, loading }),
    [game, startGame, submitRound, undoLastRound, editRoundScore, editPlayerName, finishGame, abandonGame, loading]
  );

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
