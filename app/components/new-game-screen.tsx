import { usePartySocket } from "partysocket/react";
import {  useState } from "react";
import type { State } from "../../messages";

const generateRoom = () => {
  return Math.floor((Math.random() * 10000))
}

// This is a component that will connect to the partykit backend
// and display the players in the game.
export default function NewGameScreen() {
  const [gameState, setGameState] = useState<State | undefined>();
  const [gameId] = useState<number>(generateRoom())
  
  usePartySocket({
    // connect to the party defined by 'lingo.ts'
    party: "lingo",
    // create a random room id, players can use this id to join
    room: String(gameId),
    
    onOpen() {
      console.log('client open')
    },
    onMessage(evt) {
      console.log('client message')
      const data = JSON.parse(evt.data) as State;
      setGameState(data);
    },
  });

  return !gameState ? (
    "Connecting..."
  ) : (
    <div className="presence">
      <h1>Join the game</h1>
      <p>Use code {gameId}</p>
      {gameState.players.map(player => <p key={player.name}>{player.name} joined.</p>)}
    </div>
  );
}
