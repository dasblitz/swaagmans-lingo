// We use this 'party' to get and broadcast presence information
// from all connected users. We'll use this to show how many people
// are connected to the room, and where they're from.

import type { State } from "../messages";

import type * as Party from "partykit/server";

function createMutableGame(connectionState: Party.ConnectionState<State>) {
  return {
    state: connectionState!.state,
    players: connectionState!.players.map((player) => ({
      ...player,
      lingo: [...player.lingo],
      turns: [
        ...(player?.turns?.map((turn) => ({
          attempts: [
            ...turn.attempts.map((attempt) => ({
              guess: attempt.guess,
              result: {
                correctPosition: [...attempt.result.correctPosition],
                wrongPosition: [...attempt.result.wrongPosition]
              },
            })),
          ],
        })) ?? []),
      ],
    })),
  };
}

function checkWord(guess: string) {
  const correctWordLetters = CURRENT_WORD.split("")
  const correctIndexes: number[] = [];
  const wrongPosition = new Map();
  
  guess.split("").map((letter: string, index: number) => {

    const originIndex = correctWordLetters.indexOf(letter);
    const isCorrectPosition = index === originIndex

    // letter exists and is in correct position
    if (isCorrectPosition) {
      correctIndexes.push(index)
    }
  });
  
  
  guess.split("").map((letter: string, index: number) => {

    const originIndex = correctWordLetters.indexOf(letter);
    const hasLetter = originIndex > -1;

    // check if letter exists in word but is not in the correct position
    if (
      hasLetter && !wrongPosition.get(originIndex) && !correctIndexes.includes(originIndex)
    ) {
      wrongPosition.set(originIndex, index)
    }
  });

  return {
    correctPosition: correctIndexes,
    wrongPosition: [...wrongPosition.values()]
  };
}

const CURRENT_WORD = "toren";

export default class MyRemix implements Party.Server {
  // eslint-disable-next-line no-useless-constructor
  constructor(public room: Party.Room) {}

  // we'll store the state in memory
  game: State = {
    players: [],
    state: "idle",
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
      const game = createMutableGame(connection.state);
      this.game = game;
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
        console.log(this.game.players.length);
        this.game.players.push({
          id: sender.id,
          ...data.player,
          turns: [],
          lingo: [],
        });
        if (this.game.players.length >= 1) {
          const [player1] = this.game.players;
          this.game.currentPlayer = player1;
          this.game.state = "playing";
        }
        this.room.broadcast(JSON.stringify(this.game));
        break;
      }
      case "playerGuess": {
        const turns = this.game.currentPlayer?.turns;
        let currentTurn;
        const result = checkWord(data.guess);
        const guess = String(data.guess);

        if (Array.isArray(turns) && turns.length > 0) {
          console.log("push guess to latest attempts");

          currentTurn = turns.at(turns.length - 1);

          if (currentTurn) {
            currentTurn.attempts.push({ guess, result });
          }
        } else {
          console.log("create new attempts");

          turns?.push({ attempts: [{ guess, result }] });
        }
      }
    }

    this.room.broadcast(JSON.stringify(this.game));
  }

  // This is called every time a connection is closed
  async onClose(connection: Party.Connection<State>): Promise<void> {
    console.log("close", connection);
    // let's update our state
    // first let's read the country from the connection state
    const game = createMutableGame(connection.state);
    // and update our state
    this.game = {
      state: game.players.length < 2 ? "idle" : this.game.state,
      players: game.players.filter((player) => player.id !== connection.id),
    };

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
