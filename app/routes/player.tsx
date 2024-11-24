import { useSearchParams } from "@remix-run/react";
import { State } from "messages"
import {usePartySocket} from "partysocket/react"
import { ChangeEvent, useState } from "react"
import { Attempt } from "~/components/attempt"

export default function Player() {
    const [searchParams] = useSearchParams();
    const gameRoomParam = searchParams.get('game-room')
    const [gameState, setGameState] = useState<State>()
    const [player, setPlayer] = useState<{name: string}>({name: ''})
    const [guess, setGuess] = useState<string>('')

    const handleOnChangePlayerName = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value
        setPlayer(state => {
            return {
                ...state,
                name: val
            }
        })
    }

    const handleOnChangeGuess = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        setGuess(val)
    }

    const socket = usePartySocket({
        // connect to the party defined by 'lingo.ts'
        party: "lingo",
        // this can be any name, we just picked 'index'
        room: gameRoomParam || 'no-room',
        onOpen() {
            console.log('client open')
        },
        onMessage(evt) {
            console.log('client message received')
            const data = JSON.parse(evt.data) as State;
            setGameState(data);
        },
    });

    
        
    const handleJoinGame = (event) => {
        if (!gameRoomParam) {
            console.warn('no game room found to join')
            return;
        }

        socket.updateProperties({
            party: "lingo",
            room: gameRoomParam,
        })
        socket.reconnect()
        socket.send(JSON.stringify({message: 'playerJoin', player}))
        event.preventDefault();
    }

    const handleSubmitGuess = (event) => {
        socket.send(JSON.stringify({message: 'playerGuess', player, guess}))

        event.preventDefault()
    }
    
    console.log({gameState})

    return (
        <>
            {gameState?.state === 'idle' && gameState.players.length === 1 ? (
                <p>Wachten op andere spelers</p>
            ) : null}
            {gameState?.state === 'idle' ? (
                <>
                <label htmlFor="player-name">Wat is je naam?</label>
                <form onSubmit={handleJoinGame}>
                    <input id="player-name" type="text" onChange={handleOnChangePlayerName} value={player.name}/>
                    <button >Ik doe mee</button>
                </form>
                </>
                ) : null 
            }
            {
                gameState?.state === 'playing' && socket.id === gameState?.currentPlayer?.id ?
                <>
                    <p>Jij bent aan de beurt</p>
                    <Attempt gameState={gameState} />
                    <form onSubmit={handleSubmitGuess}>
                        <input type="text" onChange={handleOnChangeGuess}/>
                        <button>Verstuur</button>
                    </form>
                </> 
                : null 
            }
            {
                gameState?.state === 'playing' && socket.id !== gameState?.currentPlayer?.id ? (
                    <p>Wait for your turn</p>
                ) : null
            }
        </>
    )
}