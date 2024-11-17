import { State } from "messages"
import {usePartySocket} from "partysocket/react"
import { ChangeEvent, useState } from "react"
import { Attempt } from "~/components/attempt"

export default function Player() {
    const [gameState, setGameState] = useState<State>()
    const [player, setPlayer] = useState<{name: string}>({name: ''})
    const [guess, setGuess] = useState<string>('')
    const [room, setRoom] = useState<string>('')
    
    const handleChangeRoom = (event: ChangeEvent<HTMLInputElement>) => {
        setRoom(event.currentTarget.value)
    }

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
        room: 'idlePlayer',
        onOpen() {
            console.log('client open')
        },
        onMessage(evt) {
            console.log('client message received')
            const data = JSON.parse(evt.data) as State;
            setGameState(data);
        },
    });

    
        
    const handleJoinGame = () => {
        socket.updateProperties({
            party: "lingo",
            room: room,
        })
        socket.reconnect()
        socket.send(JSON.stringify({message: 'playerJoin', player}))
    }

    const handleSubmitGuess = () => {
        socket.send(JSON.stringify({message: 'playerGuess', player, guess}))
    }
    
    console.log({gameState})

    return (
        <>
            {gameState?.state === 'idle' && gameState.players.length === 1 ? (
                <p>Waiting for other player</p>
            ) : null}
            {gameState?.state === 'idle' ? (
                <>
                <p>Type the code on the big screen to join</p>
                <label htmlFor="player-name">What is your name?</label>
                <input id="player-name" type="text" onChange={handleOnChangePlayerName} value={player.name}/>
                <label htmlFor="game-code">Enter the game code</label>
                <input id="game-code" type="number" onChange={handleChangeRoom} value={room}/>
                <button onClick={handleJoinGame}>Join</button>
                </>
                ) : null 
            }
            {
                gameState?.state === 'playing' && socket.id === gameState?.currentPlayer?.id ?
                <>
                    <p>It&apos;s your turn!</p>
                    <Attempt gameState={gameState} />
                    <input type="text" onChange={handleOnChangeGuess}/>
                    <button onClick={handleSubmitGuess}>Send</button>
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