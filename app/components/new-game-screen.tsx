import { usePartySocket } from "partysocket/react";
import { useEffect, useState } from "react";
import type { State } from "../../messages";
import { Attempt, getAttemptLines } from "./attempt";
import { useSearchParams } from "@remix-run/react";
import { MainTitle } from "./main-title";

const generateRoom = () => {
  return Math.floor(Math.random() * 10000);
};

interface NewGameScreenProps {
  qr: string;
}
// This is a component that will connect to the partykit backend
// and display the players in the game.
export default function NewGameScreen({ qr }: NewGameScreenProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const gameRoomParam = searchParams.get("game-room") as unknown as number;
  const [gameState, setGameState] = useState<State | undefined>();
  const [gameId] = useState<number>(gameRoomParam || generateRoom());

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
      setGameState(data);
    },
  });

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
                  <h2>Top 5</h2>
                  <ol>
                    <li
                      style={{
                        "--numColumns": `6`,
                      }}
                    >
                      {"Arjen".split("").map((letter, index) => (
                        <span
                          key={`highscore-${letter}`}
                          className="letter-box"
                          style={{
                            "--stateDelay": `${index * 0.3 + 1.3}s`,
                          }}
                        >
                          <span
                            className="letter letter--correct-pos correct-word"
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
                          "--stateDelay": `${5 * 0.3 + 1.3}s`,
                        }}
                      >
                        <span
                          className="letter letter--correct-pos correct-word"
                          style={{
                            "--delay": `${5 * 0.2}s`,
                          }}
                        >
                          100
                        </span>
                      </span>
                    </li>
                    {getAttemptLines(4, false, [""], 6)}
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
          ) : (
            <>
              <MainTitle isPlaying />
              <p className={"team-sign"}>
                Team: {gameState?.currentPlayer?.name}
              </p>
              <Attempt gameState={gameState} />
            </>
          )}
        </div>
      )}
    </>
  );
}
