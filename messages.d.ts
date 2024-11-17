// This is a shared file between the server and the client,
// showing the types of messages being passed between them.

// Keeping this simple, we send only one type of message
// (a total count of all connections and a count of connections from each country)

export interface Player {
  id: string, 
  name: string, 
  score: number, 
  turns: {
    attempts: {guess: string, result: {
      correctPosition: number[],
      wrongPosition: number[]
    }}[]
  }[], 
  lingo: number[]
}

export interface State {
  hint: string[]
  players: Array<Player>
  currentPlayer?: Player
  state: 'idle' | 'playing' | 'finished'
}
