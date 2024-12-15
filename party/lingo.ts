// We use this 'party' to get and broadcast presence information
// from all connected users. We'll use this to show how many people
// are connected to the room, and where they're from.

import { type State } from "../messages";
import _ from "lodash";

import type * as Party from "partykit/server";
import { Player } from "./player";

const highscores: { playerName: string; score: number }[] = [];

const words = ["samen", "thuis", "hekje", "toren"];

function checkWord(guess: string, currentWord: string) {
  const correctWordLetters = currentWord.split("");
  const correctPositionIds: number[] = [];
  const wrongPosition = new Map();

  guess.split("").map((letter: string, index: number) => {
    const letterAtIndex = correctWordLetters.at(index);
    const isCorrectPosition = letter === letterAtIndex;

    // letter exists and is in correct position
    if (isCorrectPosition) {
      correctPositionIds.push(index);
    }
  });

  guess.split("").map((letter: string, index: number) => {
    const originIndex = correctWordLetters.indexOf(letter);
    const hasLetter = originIndex > -1;

    // check if letter exists in word but is not in the correct position
    if (
      hasLetter &&
      !wrongPosition.get(originIndex) &&
      !correctPositionIds.includes(originIndex)
    ) {
      wrongPosition.set(originIndex, index);
    }
  });

  const wrongPositionIds = [...wrongPosition.values()];

  return {
    correctPosition: correctPositionIds,
    wrongPosition: wrongPositionIds,
    wordCorrect: correctPositionIds.length === correctWordLetters.length,
    score: correctPositionIds.length * 10 + wrongPositionIds.length * 2,
  };
}

export default class MyRemix implements Party.Server {
  introTimeout: NodeJS.Timeout | null = null;
  resetTimeout: NodeJS.Timeout | null = null;

  // eslint-disable-next-line no-useless-constructor
  constructor(public room: Party.Room) {}

  // we'll store the state in memory
  game: State = {
    hint: [words[0].split("")?.[0]],
    highScores: highscores.sort((highscoreA, highscoreB) =>
      highscoreA.score < highscoreB.score ? 1 : -1
    ),
    players: [],
    state: "idle",
    currentWordIndex: 0,
    currentWord: words[0],
  };
  // let's opt in to hibernation mode, for much higher concurrency
  // like, 1000s of people in a room 🤯
  // This has tradeoffs for the developer, like needing to hydrate/rehydrate
  // state on start, so be careful!
  static options = {
    hibernate: true,
  };

  // This is called every time a new room is made
  // since we're using hibernation mode, we should
  // "rehydrate" this.state here from all connections
  onStart(): void | Promise<void> {
    for (const connection of this.room.getConnections<State>()) {
      console.log("start");
      if (connection.state) {
        // @ts-expect-error expect error
        this.game = _.cloneDeep(connection.state);
      }
    }
  }

  // This is called every time a new connection is made
  async onConnect(
    connection: Party.Connection<State>
    // ctx: Party.ConnectionContext
  ): Promise<void> {
    console.log("connect", this.room.id);
    // Let's read the country from the request context
    // const from = (ctx.request.cf?.country ?? "unknown") as string;
    // and update our state

    // let's also store where we're from on the connection
    // so we can hydrate state on start, as well as reference it on close
    connection.setState(this.game);
    // finally, let's broadcast the new state to all connections
    this.room.broadcast(JSON.stringify(this.game));
  }

  async onMessage(
    message: string | ArrayBuffer | ArrayBufferView,
    sender: Party.Connection
  ): Promise<void> {
    const data = JSON.parse(message as string);
    console.log({ data });
    switch (data.message) {
      case "playerJoin": {
        console.log("players", this.game.players.length);

        this.game.state = "introduction";
        this.room.broadcast(JSON.stringify(this.game));
        const player = new Player(data.player.name, sender.id);
        this.game.players = [player];
        this.introTimeout = setTimeout(() => {
          if (this.game.players.length >= 1) {
            const [player1] = this.game.players;
            this.game.currentPlayer = player1;
            this.game.state = "playing";
          }

          this.startCountDown();
          this.room.broadcast(JSON.stringify(this.game));
        }, 19500);
        break;
      }
      case "playerGuess": {
        const result = checkWord(data.guess, this.game.currentWord);

        const guess = String(data.guess);
        console.log("push guess to latest attempts");
        this.game.currentPlayer.addAttempt(guess, result);
        const currentTurn = this.game.currentPlayer?.currentTurn();
        if (result.wordCorrect) {
          this.game.currentPlayer.score +=
            100 * (6 - currentTurn.attempts.length);

          setTimeout(() => {
            console.log("setTimeout");
            this.startNewTurn();
          }, 7000);
        }
        break;
      }
    }

    if (this.game.currentPlayer) {
      // setTimeout and move to next word
    }

    console.log("broadcast from on message");
    this.room.broadcast(JSON.stringify(this.game));
  }

  startNewTurn() {
    console.log("startNewTurn");
    this.game.currentPlayer?.turns.push({ attempts: [] });
    this.game.currentWordIndex =
      this.game.currentWordIndex === words.length - 1
        ? 0
        : this.game.currentWordIndex + 1;
    this.game.currentWord = words[this.game.currentWordIndex];
    this.game.hint = [this.game.currentWord.split("")?.[0]];
    console.log("broadcast from start new turn");
    this.room.broadcast(JSON.stringify(this.game));
  }

  startCountDown() {
    this.resetTimeout = setTimeout(() => {
      console.log("reset from timeout");
      this.resetGame();
    }, 60 * 1000);
  }

  sortHighScores() {
    this.game.highScores = this.game.highScores.sort((highscoreA, highscoreB) =>
      highscoreA.score < highscoreB.score ? 1 : -1
    );
  }

  resetGame() {
    // and update our state
    highscores.push({
      playerName: this.game.currentPlayer.name,
      score: this.game.currentPlayer.score,
    });

    this.sortHighScores();

    this.game = {
      state: "idle",
      currentWordIndex: 0,
      currentWord: words[0],
      highScores: highscores,
      hint: [words[0].split("")?.[0]],
      players: [],
    };

    this.resetTimeout && clearTimeout(this.resetTimeout);
    this.introTimeout && clearTimeout(this.introTimeout);

    this.room.broadcast(JSON.stringify(this.game));
  }

  // This is called every time a connection is closed
  async onClose(connection: Party.Connection<State>): Promise<void> {
    console.log("close", connection);

    // let's update our state
    // first let's read the game from the connection state
    this.resetGame();

    // finally, let's broadcast the new state to all connections
    this.room.broadcast(JSON.stringify(this.game));
  }

  // This is called when a connection has an error
  async onError(
    connection: Party.Connection<State>,
    err: Error
  ): Promise<void> {
    console.log("error");
    // let's log the error
    console.error(err);
    // and close the connection
    await this.onClose(connection);
  }
}

MyRemix satisfies Party.Worker;
