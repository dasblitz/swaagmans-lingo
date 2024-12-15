import { useSearchParams } from "@remix-run/react";
import { State } from "messages";
import { usePartySocket } from "partysocket/react";
import { FormEvent, useEffect, useState } from "react";
import { Attempt } from "~/components/attempt";
import { CountDown } from "~/components/countdown";
import { MainTitle } from "~/components/main-title";
import { SubmitGuessForm } from "~/components/submit-guess-form";
import { Howl } from "howler";
import { gameAudioConfig } from "../sound/game-audio";

const gameAudio = new Howl(gameAudioConfig);

interface FormElements extends HTMLFormControlsCollection {
  userName: HTMLInputElement;
}

interface UserNameFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export const loader = () => {
  return null;
};

export default function Player() {
  const [searchParams] = useSearchParams();
  const gameRoomParam = searchParams.get("game-room");
  const [gameState, setGameState] = useState<State>();
  const [player, setPlayer] = useState<{ name: string }>({ name: "" });

  useEffect(() => {
    const initAudio = function () {
      if (gameState?.state === "playing") {
        gameAudio.play("you-can-start");
      }
      document.removeEventListener("click", initAudio);
    };

    document.addEventListener("click", initAudio);

    return () => {
      document.removeEventListener("click", initAudio);
    };
  }, [gameState?.state]);

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
    gameAudio.play("you-can-start");

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

  const handleSubmitGuess = (guess: string) => {
    try {
      socket.send(JSON.stringify({ message: "playerGuess", guess: guess }));
    } catch (error) {
      console.error(error);
    }
  };

  console.log({ gameState });

  return (
    <div className="player-screen">
      {gameState?.state === "idle" ? (
        <div>
          <MainTitle />
          <p className="introduction">Wat leuk dat je mee doet!</p>
          <form onSubmit={handleJoinGame}>
            <label htmlFor="player-name" className="introduction">
              Wat is je naam?
            </label>
            <input
              id="player-name"
              type="text"
              name="userName"
              placeholder="Naam"
              onChange={handleOnChangePlayerName}
              value={player.name}
            />
            <button>Beginnen</button>
          </form>
        </div>
      ) : null}

      {gameState?.state === "introduction" ? (
        <p className="explanation">Raad zoveel mogelijk woorden in 1 minuut!</p>
      ) : null}

      {gameState?.state === "playing" &&
      socket.id === gameState?.currentPlayer?.id ? (
        <>
          <div className="player-header">
            <p className="score-board">
              Score: {gameState?.currentPlayer.score}
            </p>
            <CountDown />
          </div>
          <Attempt gameState={gameState} />
          <SubmitGuessForm onSubmit={handleSubmitGuess} />
        </>
      ) : null}
      {gameState?.state === "playing" &&
      socket.id !== gameState?.currentPlayer?.id ? (
        <p>Wacht op je beurt</p>
      ) : null}
    </div>
  );
}
