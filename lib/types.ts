export interface Player {
  id: string;
  name: string;
}

export interface RoundScore {
  playerId: string;
  points: number;
}

export interface Round {
  roundNumber: number; // 1–10
  doubleOpener: number; // 9,8,7,6,5,4,3,2,1,0
  scores: RoundScore[];
}

export interface Game {
  id: string;
  startedAt: string;
  finishedAt?: string;
  players: Player[];
  rounds: Round[];
  currentRound: number; // 1-based, 11 = game over
}

export interface SavedGame {
  id: string;
  date: string;
  playerNames: string[];
  winner: string;
  finalScores: { name: string; total: number }[];
}
