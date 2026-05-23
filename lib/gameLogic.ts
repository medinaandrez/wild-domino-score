import { Game, Player, Round, RoundScore } from "./types";

export const DEFAULT_ROUND_COUNT = 10;
export const DOUBLE_OPENERS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
export const SPINNER_TILE_VALUE = 10;

export function createGame(playerNames: string[], totalRounds: number = DEFAULT_ROUND_COUNT): Game {
  const players: Player[] = playerNames.map((name, i) => ({
    id: String(i),
    name: name.trim(),
  }));
  return {
    id: Date.now().toString(),
    startedAt: new Date().toISOString(),
    players,
    rounds: [],
    currentRound: 1,
    totalRounds,
  };
}

export function getDoubleOpener(roundNumber: number): number {
  return DOUBLE_OPENERS[roundNumber - 1];
}

export function getTotalScore(game: Game, playerId: string): number {
  return game.rounds.reduce((sum, round) => {
    const score = round.scores.find((s) => s.playerId === playerId);
    return sum + (score?.points ?? 0);
  }, 0);
}

export function getScoreForRound(
  round: Round,
  playerId: string
): number | undefined {
  return round.scores.find((s) => s.playerId === playerId)?.points;
}

export function addRound(game: Game, scores: RoundScore[]): Game {
  const round: Round = {
    roundNumber: game.currentRound,
    doubleOpener: getDoubleOpener(game.currentRound),
    scores,
  };
  const updatedRounds = [...game.rounds, round];
  const nextRound = game.currentRound + 1;
  return {
    ...game,
    rounds: updatedRounds,
    currentRound: nextRound,
    finishedAt:
      nextRound > game.totalRounds ? new Date().toISOString() : undefined,
  };
}

export function isGameOver(game: Game): boolean {
  return game.currentRound > game.totalRounds;
}

export function getRanking(game: Game): { player: Player; total: number }[] {
  return game.players
    .map((p) => ({ player: p, total: getTotalScore(game, p.id) }))
    .sort((a, b) => a.total - b.total);
}

export function getLeader(game: Game): Player | null {
  if (game.players.length === 0) return null;
  return getRanking(game)[0].player;
}
