import { State } from "messages"
import {usePartySocket} from "partysocket/react"
import { ChangeEvent, useState } from "react"

export default function Player() {
    const [gameState, setGameState] = useState<State>()
    const [player, setPlayer] = useState<{name: string}>({name: 'a'})
    const [room, setRoom] = useState<string>('')
    
    const handleChangeRoom = (event: ChangeEvent<HTMLInputElement>) => {
        setRoom(event.currentTarget.value)
    }

    const handleChangePlayerName = (event: ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value
        setPlayer(state => {
            return {
                ...state,
                name: val
            }
        })
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
        socket.send(JSON.stringify({message: 'setPlayer', player}))
    }
    
    console.log({gameState})

    return (
        <>
        <p>Type the code on the big screen to join</p>
        <label htmlFor="player-name">What is your name?</label>
        <input id="player-name" type="text" onChange={handleChangePlayerName} value={player.name}/>
        <label htmlFor="game-code">Enter the game code</label>
        <input id="game-code" type="number" onChange={handleChangeRoom} value={room}/>
        <button onClick={handleJoinGame}>Join</button>
        </>
    )
}