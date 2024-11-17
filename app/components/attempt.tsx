import { State } from "messages";

interface AttemptProps {
  gameState: State;
}

const getAttemptLines = (remainingLines: number) => {
  const attemptLines = []

  for (let i = 0; i < remainingLines; i++) {
    attemptLines.push((
      <li key={`remaining-${i}`}>
        <span className='letter-box'></span>
        <span className='letter-box'></span>
        <span className='letter-box'></span>
        <span className='letter-box'></span>
        <span className='letter-box'></span>
      </li>
    ))
  }

  return attemptLines
}

export function Attempt({ gameState }: AttemptProps) {
  if (!gameState.currentPlayer) {
    return;
  }

  const currentTurn = gameState.currentPlayer.turns.at(-1)
  const previousAttempt = currentTurn?.attempts.at(currentTurn?.attempts.length -1);
  const remainingLines = 5 - (currentTurn?.attempts.length ?? 0) - (previousAttempt ? 1 : 0)
  
  // TODO: add check to see if a letter has changed compared to the previous turn if so, always add the delay even if it's correct
  // const previousAttempt = currentTurn?.attempts.at(attemptIndex -1) || null
  return (
    <>
      <ol>
        {currentTurn?.attempts.map((attempt, attemptIndex, arr) => {
          const previousGuess = arr.at(attemptIndex -1)?.guess.split('') || []
          return (
            <>
              <li key={attempt.guess}>
                {attempt.guess.split("").map((letter, index) => {
                  // const shouldDelay = previousGuess[index] !== letter ? 1 : 0

                  return (
                    <span className='letter-box' key={`${attempt.guess}-${letter}-${attemptIndex}-${index}`}>
                      <span
                        className={`letter ${attempt.result.correctPosition.includes(index) && 'letter--correct-pos'} ${attempt.result.wrongPosition.includes(index) && 'letter--incorrect-pos'}`}
                        style={{
                          '--delay': `${index * 0.2}s`, 
                          '--stateDelay': `${(index * 0.3) + 1.3}s`
                        }}
                      >
                        {letter}
                      </span>
                    </span>
                  )
                })}
              </li>
            </>
        )})}
        {/* Add the line for the new attempt, showing only letters in the correct place */}
        {previousAttempt && remainingLines ? (
          <li key={`newAttempt-${remainingLines}`}>
            {previousAttempt.guess.split("").map((letter, index) => (
              <span className='letter-box' key={`last-attempt-${letter}-${index}`}>
                <span
                  className={`letter`}
                  style={{
                    '--delay': `${3}s`, 
                  }}
                >
                  {previousAttempt.result.correctPosition.includes(index) ? letter : "."}
                </span>
              </span>
            ))}
          </li>
        ) : null}

        {getAttemptLines(remainingLines)}
      </ol>
    </>
  );
}
