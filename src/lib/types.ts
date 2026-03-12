export interface Land {
  land: string;
  hoofdstad: string;
  prominente_steden: string[];
  inwoners: number;
  vlag: string;
  moeilijkheid: number;
}

export type GameStatus = "idle" | "playing" | "feedback" | "gameover";

export interface GameState {
  status: GameStatus;
  currentLand: Land | null;
  streak: number;
  totalAnswered: number;
  lastAnswerCorrect: boolean | null;
  userAnswer: string;
}

export interface HighScore {
  streak: number;
  date: string;
  totalAnswered: number;
}
