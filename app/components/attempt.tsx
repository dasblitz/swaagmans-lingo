import { State } from "messages";
import { Howl } from "howler";

interface AttemptProps {
  gameState: State;
  gameAudio: Howl;
}

export const getAttemptLines = (
  remainingLines: number,
  previousAttempt: boolean,
  hint: string[],
  numColumns = 5
) => {
  if (remainingLines <= 0) {
    return;
  }

  const attemptLines = [];

  for (let i = 0; i < remainingLines; i++) {
    const isFirst = !previousAttempt && i === 0;

    attemptLines.push(
      <li key={`remaining-${i}`} style={{ "--numColumns": numColumns }}>
        {Array.from(Array(numColumns)).map((col, index) => (
          <span key={`remaining-${i}-${col}-${index}`} className="letter-box">
            {isFirst ? (
              <span
                className="letter"
                style={{
                  "--delay": `${0.2}s`,
                }}
              >
                {index === 0 ? hint[0] : "."}
              </span>
            ) : null}
          </span>
        ))}
      </li>
    );
  }

  return attemptLines;
};

const delay = (timeout: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

async function playSounds(
  gameAudio: Howl,
  guess: string,
  result: { correctPosition: number[]; wrongPosition: number[] },
  wordGuessed: boolean
) {
  if (!gameAudio) {
    return;
  }

  const letters = guess.split("");

  console.log("playSounds", letters);
  let index = 0;
  for (const letter of letters) {
    const offset = index === 0 ? 1300 : 0;
    if (result.correctPosition.includes(index)) {
      await delay(offset);
      gameAudio.play("letter-correct");
      await delay(250);
    } else if (result.wrongPosition.includes(index)) {
      await delay(offset);
      gameAudio.play("letter-wrong-position");
      await delay(250);
    } else {
      await delay(offset);
      gameAudio.play("letter-wrong");
      await delay(250);
    }
    index++;
  }

  if (wordGuessed) {
    const indexes = [1, 2, 3];
    const index = indexes[Math.floor(Math.random() * indexes.length)];
    gameAudio.play(`word-correct-${index}`);
  }
}

function getHasNewAttempt(
  wordGuessed: boolean,
  previousAttempt: boolean,
  nrOfAttempts = 0
) {
  return !wordGuessed && previousAttempt && nrOfAttempts < 5;
}

export function Attempt({ gameState, gameAudio }: AttemptProps) {
  if (!gameState.currentPlayer) {
    return;
  }

  const currentTurn = gameState.currentPlayer.turns.at(-1);
  const hint = gameState.hint;
  const previousAttempt = currentTurn?.attempts.at(
    currentTurn?.attempts.length - 1
  );
  const wordGuessed = previousAttempt?.result.correctPosition.length === 5;

  if ((previousAttempt?.guess, previousAttempt?.result)) {
    playSounds(
      gameAudio,
      previousAttempt?.guess,
      previousAttempt?.result,
      wordGuessed
    );
  }

  const nrOfPreviousAttempts = currentTurn?.attempts.length ?? 0;

  const hasNewAttempt = getHasNewAttempt(
    wordGuessed,
    !!previousAttempt,
    nrOfPreviousAttempts
  );

  const remainingLines = 5 - nrOfPreviousAttempts - (hasNewAttempt ? 1 : 0);

  // TODO: add check to see if a letter has changed compared to the previous turn if so, always add the delay even if it's correct
  // const previousAttempt = currentTurn?.attempts.at(attemptIndex -1) || null
  return (
    <>
      <ol>
        {currentTurn?.attempts.map((attempt, attemptIndex: number) => {
          const currentCorrect = attempt.result.correctPosition.length === 5;

          return (
            <>
              <li key={attempt.guess}>
                {attempt.guess.split("").map((letter, index) => {
                  return (
                    <span
                      className="letter-box"
                      key={`${attempt.guess}-${letter}-${attemptIndex}-${index}`}
                      style={{
                        "--stateDelay": `${index * 0.3 + 1.3}s`,
                      }}
                    >
                      <span
                        className={`letter ${
                          currentCorrect ? "correct-word" : ""
                        } ${
                          attempt.result.correctPosition.includes(index) &&
                          "letter--correct-pos"
                        } ${
                          attempt.result.wrongPosition.includes(index) &&
                          "letter--incorrect-pos"
                        }`}
                        style={{
                          "--delay": `${index * 0.2}s`,
                        }}
                      >
                        {letter}
                      </span>
                    </span>
                  );
                })}
              </li>
            </>
          );
        })}
        {/* Add the line for the new attempt, showing only letters in the correct place */}
        {hasNewAttempt ? (
          <li key={`newAttempt-${remainingLines}`}>
            {previousAttempt?.guess.split("").map((letter, index) => (
              <span
                className="letter-box"
                key={`last-attempt-${letter}-${index}`}
              >
                <span
                  className={`letter`}
                  style={{
                    "--delay": `${3}s`,
                  }}
                >
                  {index === 0
                    ? gameState.hint[index]
                    : previousAttempt.result.correctPosition.includes(index)
                    ? letter
                    : "."}
                </span>
              </span>
            ))}
          </li>
        ) : null}

        {getAttemptLines(remainingLines, !!previousAttempt, hint)}
      </ol>
    </>
  );
}
