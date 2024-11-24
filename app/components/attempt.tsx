import { State } from "messages";

interface AttemptProps {
  gameState: State;
}

export const getAttemptLines = (
  remainingLines: number,
  previousAttempt: boolean,
  hint: string[],
  numColumns = 5,
) => {
  const attemptLines = [];

  for (let i = 0; i < remainingLines; i++) {
    const isFirst = !previousAttempt && i === 0;

    attemptLines.push(
      <li key={`remaining-${i}`} style={{'--numColumns': numColumns}}>
        {Array.from(Array(numColumns)).map((col, index) => (
          <span key={col} className="letter-box">
            {isFirst ? (
              <span
                className="letter"
                style={{
                  "--delay": `${0.2}s`,
                }}
              >
                {index === 0 ? hint[0] : '.'}
              </span>
            ) : null}
          </span>
        ))}
      </li>
    );
  }

  return attemptLines;
};

export function Attempt({ gameState }: AttemptProps) {
  if (!gameState.currentPlayer) {
    return;
  }

  const currentTurn = gameState.currentPlayer.turns.at(-1);
  const hint = gameState.hint;
  const previousAttempt = currentTurn?.attempts.at(
    currentTurn?.attempts.length - 1
  );
  const remainingLines =
    5 - (currentTurn?.attempts.length ?? 0) - (previousAttempt ? 1 : 0);

  // TODO: add check to see if a letter has changed compared to the previous turn if so, always add the delay even if it's correct
  // const previousAttempt = currentTurn?.attempts.at(attemptIndex -1) || null
  return (
    <>
      <ol>
        {currentTurn?.attempts.map((attempt, attemptIndex) => {
          const wordGuessed = attempt.result.correctPosition.length === 5;

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
                          wordGuessed ? "correct-word" : ""
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
        {previousAttempt && (currentTurn?.attempts?.length || 0) < 5 ? (
          <li key={`newAttempt-${remainingLines}`}>
            {previousAttempt.guess.split("").map((letter, index) => (
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
                  {index === 0 ?
                    gameState.hint[index] 
                    : previousAttempt.result.correctPosition.includes(index) ? letter
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
