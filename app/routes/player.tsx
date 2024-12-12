import { useSearchParams } from "@remix-run/react";
import { State } from "messages";
import { usePartySocket } from "partysocket/react";
import { ChangeEvent, FormEvent, useState } from "react";
import { Attempt } from "~/components/attempt";
import { gameAudioConfig } from "~/sound/game-audio";
import { Howl } from "howler";

interface FormElements extends HTMLFormControlsCollection {
  userName: HTMLInputElement;
}

interface UserNameFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

interface GuessFormElements extends HTMLFormControlsCollection {
  guess: HTMLInputElement;
}

interface GuessFormElement extends HTMLFormElement {
  readonly elements: GuessFormElements;
}

export default function Player() {
  const [searchParams] = useSearchParams();
  const gameRoomParam = searchParams.get("game-room");
  const [gameState, setGameState] = useState<State>();
  const [player, setPlayer] = useState<{ name: string }>({ name: "" });

  const socket = usePartySocket({
    // connect to the party defined by 'lingo.ts'
    party: "lingo",
    // this can be any name, we just picked 'index'
    room: gameRoomParam || "no-room",
    onOpen() {
      console.log("client open");
    },
    onMessage(evt) {
      console.log("client message received");
      const data = JSON.parse(evt.data) as State;
      console.log(data);
      setGameState(data);
    },
  });

  const handleOnChangePlayerName = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const username = event.currentTarget.value;
    setPlayer((state) => {
      return {
        ...state,
        name: username,
      };
    });
  };

  const handleJoinGame = (event: FormEvent<UserNameFormElement>) => {
    if (!gameRoomParam) {
      console.warn("no game room found to join");
      event.preventDefault();
      return;
    }

    try {
      socket.updateProperties({
        party: "lingo",
        room: gameRoomParam,
      });
      socket.reconnect();
      socket.send(JSON.stringify({ message: "playerJoin", player }));
    } catch (error) {
      console.error(error);
    }
    event.preventDefault();
  };

  const handleOnChangeGuess = (event: ChangeEvent<HTMLInputElement>) => {
    // const val = event.currentTarget.value;
    // setGuess(val);
  };

  const handleSubmitGuess = (event: FormEvent<GuessFormElement>) => {
    try {
      const guess = event.currentTarget.elements.guess.value;

      socket.send(JSON.stringify({ message: "playerGuess", guess: guess }));
    } catch (error) {
      console.error(error);
    }

    event.preventDefault();
    return false;
  };

  console.log({ gameState });

  return (
    <>
      {gameState?.state === "idle" && gameState.players.length === 1 ? (
        <p>Wachten op andere spelers</p>
      ) : null}
      {gameState?.state === "idle" ? (
        <>
          <label htmlFor="player-name">Wat is je naam?</label>
          <form onSubmit={handleJoinGame}>
            <input
              id="player-name"
              type="text"
              name="userName"
              onChange={handleOnChangePlayerName}
              value={player.name}
            />
            <button>Ik doe mee</button>
          </form>
        </>
      ) : null}
      {gameState?.state === "playing" &&
      socket.id === gameState?.currentPlayer?.id ? (
        <>
          <p>Jij bent aan de beurt</p>
          <p className="score-board">Score: {gameState?.currentPlayer.score}</p>
          <Attempt gameState={gameState} />
          <form onSubmit={handleSubmitGuess}>
            <input type="text" name="guess" onChange={handleOnChangeGuess} />
            <button>Verstuur</button>
          </form>
        </>
      ) : null}
      {gameState?.state === "playing" &&
      socket.id !== gameState?.currentPlayer?.id ? (
        <p>Wacht op je beurt</p>
      ) : null}
    </>
  );
}
