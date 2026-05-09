import { Game, Player, Round, RoundScore } from "./types";

export const TOTAL_ROUNDS = 10;
export const DOUBLE_OPENERS = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
export const SPINNER_TILE_VALUE = 10;

export function createGame(playerNames: string[]): Game {
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
  };
}

export function getDoubleOpener(roundNumber: number): number {
  return DOUBLE_OPENERS[roundNumber - 1];
}

export function getRoundLabel(roundNumber: number): string {
  return `Ronda ${roundNumber} — Doble ${getDoubleOpener(roundNumber)}`;
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
      nextRound > TOTAL_ROUNDS ? new Date().toISOString() : undefined,
  };
}

export function isGameOver(game: Game): boolean {
  return game.currentRound > TOTAL_ROUNDS;
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
