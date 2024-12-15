import { AttemptResult, Turn } from "messages";

export class Player {
  name = "";
  id = "";
  score = 0;
  turns: Turn[] = [];

  constructor(name: string, id: string) {
    this.name = name;
    this.id = id;
  }

  currentTurn() {
    return this.turns.at(-1);
  }

  lastAttempt() {
    this.currentTurn()?.attempts.at(-1);
  }

  addAttempt(guess: string, result: AttemptResult) {
    console.log(this.currentTurn(), this.turns);
    if (this.currentTurn()) {
      console.log("currentTurn");
      this.currentTurn()?.attempts.push({ guess, result });
    } else {
      console.log("hier");
      try {
        this.turns.push({ attempts: [{ guess, result }] });

        console.log(this.turns);
      } catch (e) {
        console.error(e);
      }
    }
  }

  increaseScore(score: number) {
    this.score += score;
  }
}
