import { usePartySocket } from "partysocket/react";
import { useEffect, useState } from "react";
import type { State } from "../../messages";
import { Attempt, getAttemptLines } from "./attempt";
import { useSearchParams } from "@remix-run/react";
import { MainTitle } from "./main-title";

import { gameAudioConfig } from "~/sound/game-audio";
import { Howl, Howler } from "howler";

// Howler.volume(1.4);

const generateRoom = () => {
  return Math.floor(Math.random() * 10000);
};

interface NewGameScreenProps {
  qr: string;
}

let tuneLoopId = 0;
let tuneIntroId = 0;
// This is a component that will connect to the partykit backend
// and display the players in the game.
export default function NewGameScreen({ qr }: NewGameScreenProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const gameRoomParam = searchParams.get("game-room") as unknown as number;
  const [gameState, setGameState] = useState<State | undefined>();
  const [gameId] = useState<number>(gameRoomParam || generateRoom());
  const [gameAudio, setGameAudio] = useState<Howl>();

  const highScores = gameState?.highScores.slice(0, 8);
  const longestName =
    highScores?.reduce((prev, next): number => {
      return Math.max(prev, next.playerName.length);
    }, 0) || 5;

  const adjustedHighScores = highScores?.map((highscore) => {
    while (highscore.playerName.length < longestName) {
      highscore.playerName = highscore.playerName.concat(".");
    }

    return highscore;
  });
  const gridSize = longestName + 1;

  usePartySocket({
    // connect to the party defined by 'lingo.ts'
    party: "lingo",
    // create a random room id, players can use this id to join
    room: String(gameId),

    onOpen() {
      console.log("client open");
    },
    onMessage(evt) {
      console.log("client message");
      const data = JSON.parse(evt.data) as State;

      if (
        data.state === "introduction" &&
        gameState?.state !== "introduction"
      ) {
        // play intro tune]
        tuneLoopId && gameAudio?.stop(tuneLoopId);
        gameAudio?.play("intro");
      }

      console.log(data.state, gameState?.state);
      // if (data.state === "idle" && gameState?.state === "playing") {
      //   // play intro tune]
      //   tuneLoopId = gameAudio?.play("tune-loop");
      // }
      setGameState(data);
    },
  });

  useEffect(() => {
    const initAudio = function () {
      const gameAudio = new Howl(gameAudioConfig);
      setGameAudio(gameAudio);
      // gameAudio.once("end", () => {
      //   gameAudio.play("you-can-start");
      // });
      document.removeEventListener("click", initAudio);
    };

    document.addEventListener("click", initAudio);

    return () => {
      document.removeEventListener("click", initAudio);
    };
  }, []);

  useEffect(() => {
    if (!gameRoomParam) {
      setSearchParams(
        (prev) => {
          prev.set("game-room", String(gameId));
          return prev;
        },
        { replace: true }
      );
    }
  }, [gameRoomParam, setSearchParams, gameId]);

  return (
    <>
      <div className="background"></div>
      {!gameState ? (
        "Connecting..."
      ) : (
        <div className="presence">
          {gameState.state === "idle" ? (
            <>
              <MainTitle />
              {gameState.players.map((player) => (
                <p key={player.name}>
                  {player.name} Doet mee. Wacht op andere spelers...
                </p>
              ))}
              <section className="footer">
                <div>
                  <h2 className="team-sign">Top 8</h2>
                  <ol>
                    {adjustedHighScores?.map((highScore, highScoreIndex) => (
                      <li
                        key={`${highScore.playerName}-${highScore.score}-${highScoreIndex}`}
                        style={{
                          "--numColumns": gridSize,
                        }}
                      >
                        {highScore.playerName.split("").map((letter, index) => (
                          <span
                            key={`highscore-${letter}-${highScoreIndex}-${index}`}
                            className="letter-box"
                            style={{
                              "--stateDelay": `${index * 0.3 + 1.3}s`,
                            }}
                          >
                            <span
                              className={`letter ${
                                highScoreIndex === 0
                                  ? "letter--correct-pos correct-word"
                                  : ""
                              }`}
                              style={{
                                "--delay": `${index * 0.2}s`,
                              }}
                            >
                              {letter}
                            </span>
                          </span>
                        ))}
                        <span
                          key={`highscore-score`}
                          className="letter-box"
                          style={{
                            "--stateDelay": `${gridSize * 0.3 + 1.3}s`,
                          }}
                        >
                          <span
                            className={`letter ${
                              highScoreIndex === 0
                                ? "letter--correct-pos correct-word"
                                : ""
                            }`}
                            style={{
                              "--delay": `${gridSize * 0.2}s`,
                            }}
                          >
                            {highScore.score}
                          </span>
                        </span>
                      </li>
                    ))}
                    {getAttemptLines(
                      8 - (highScores?.length ?? 0),
                      false,
                      ["."],
                      gridSize
                    )}
                  </ol>
                </div>
                <div className="qr-container">
                  <p className="introduction">
                    Scan de code met je telefoon om mee te doen:
                  </p>
                  <img
                    className="qr-code"
                    src={qr}
                    alt="scan deze qr code om deel te nemen"
                  />
                </div>
              </section>
            </>
          ) : gameState.state === "introduction" ? (
            <p className="explanation">
              Raad zoveel mogelijk woorden in 1 minuut!
            </p>
          ) : (
            <>
              <MainTitle isPlaying />
              <p className={"team-sign"}>
                Team: {gameState?.currentPlayer?.name}
              </p>
              <Attempt gameState={gameState} gameAudio={gameAudio} />
            </>
          )}
        </div>
      )}
    </>
  );
}
