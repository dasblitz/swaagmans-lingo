// This is a shared file between the server and the client,
// showing the types of messages being passed between them.

// Keeping this simple, we send only one type of message
// (a total count of all connections and a count of connections from each country)

interface AttemptResult {
  correctPosition: number[];
  wrongPosition: number[];
  wordCorrect: boolean;
}

interface Attempt {
  guess: string;
  result: AttemptResult;
}

interface Turn {
  attempts: Attempt[];
}

interface HighScore {
  playerName: string;
  score: number;
}

export interface State {
  hint: string[];
  players: Array<Player>;
  highScores: HighScore[];
  currentPlayer?: Player;
  currentWordIndex: number;
  currentWord: string;
  state: "idle" | "introduction" | "playing" | "finished";
}
