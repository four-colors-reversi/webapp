import { useState, ChangeEvent, useMemo } from 'react'

import GameManager, { Stone, Player } from '../utils/game'

import Field from './Field'

export interface GameState {
	turn: number
	players: Player[]
	field: Stone[][]
	score: number[]
}

interface SetAction {
	type: 'SET'
	data: {
		position: {
			x: number
			y: number
		}
	}
}

interface PassAction {
	type: 'PASS'
}

const Game = () => {
	const [playerName, setPlayerName] = useState<string>('player')
	const [roomId, setRoomId] = useState<string>('')
	const [gameWs, setGameWs] = useState<WebSocket | null>(null)
	const [isGameEnd, setIsGameEnd] = useState<boolean>(false)
	const [gameState, setGameState] = useState<GameState | null>(null)

	const onMessageGameWs = (msg: MessageEvent<any>) => {
		const response = JSON.parse(msg.data)
		console.log(response)
		switch (response.type) {
			case 'UPDATE': {
				setGameState({
					turn: response.turn,
					players: [
						new Player(
							response.players[0].name,
							response.players[0].colors[0],
							response.players[0].colors[1]
						),
						new Player(
							response.players[1].name,
							response.players[1].colors[0],
							response.players[1].colors[1]
						),
					],
					field: response.field,
					score: response.score,
				})
				break
			}
			case 'END': {
				setIsGameEnd(true)
				break
			}
		}
	}

	const onMessageMatchingWs = (msg: MessageEvent<any>) => {
		const response = JSON.parse(msg.data)
		console.log(response)
		switch (response.type) {
			case 'JOINED': {
				break
			}
			case 'MATCHED': {
				const game_ws = new WebSocket(
					response.url,
					btoa(JSON.stringify({ data: { session_id: response.session_id } })).replaceAll('=', '')
				)
				game_ws.onmessage = onMessageGameWs
				setGameWs(game_ws)
				break
			}
		}
	}

	const createMatchingRoom = () => {
		const action = { type: 'CREATE', data: { player_name: playerName } }
		const action_base64 = btoa(JSON.stringify(action)).replaceAll('=', '')
		const ws = new WebSocket('ws://localhost:8080/matching', action_base64)
		ws.onmessage = onMessageMatchingWs
	}

	const joinMatchingRoom = () => {
		const action = { type: 'JOIN', data: { player_name: playerName, room_id: roomId } }
		const action_base64 = btoa(JSON.stringify(action)).replaceAll('=', '')
		const ws = new WebSocket('ws://localhost:8080/matching', action_base64)
		ws.onmessage = onMessageMatchingWs
	}

	const executeAction = (action: SetAction | PassAction) => {
		if (gameWs == null) return
		console.log(action)
		gameWs.send(JSON.stringify(action))
	}

	const is_my_turn = useMemo(() => {
		if (gameState?.turn == undefined || gameState?.players == undefined) return false
		if (GameManager.getTurnPlayer(gameState?.turn, gameState?.players).name == playerName)
			return true
		return false
	}, [gameState])

	return (
		<div>
			{gameWs == null || gameState == null ? (
				<div>
					<input
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setPlayerName(e.target.value)
						}}
						value={playerName}
					/>
					<input
						onChange={(e: ChangeEvent<HTMLInputElement>) => {
							setRoomId(e.target.value)
						}}
						value={roomId}
					/>
					<button onClick={() => createMatchingRoom()}>create matching</button>
					<button onClick={() => joinMatchingRoom()}>join matching</button>
				</div>
			) : (
				<div>
					<p>
						{gameState.players[0].name}
						{gameState.players[0].name == playerName ? '(you)' : null}: {gameState.score[0]}
					</p>
					<p>
						{gameState.players[1].name}
						{gameState.players[1].name == playerName ? '(you)' : null}: {gameState.score[1]}
					</p>
					<Field
						executeAction={(action: SetAction | PassAction) => executeAction(action)}
						gameState={gameState}
						isMyTurn={is_my_turn}
					/>
				</div>
			)}
		</div>
	)
}

export default Game
