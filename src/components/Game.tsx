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
		const ws = new WebSocket('ws://192.168.10.63:8080/matching', action_base64)
		ws.onmessage = onMessageMatchingWs
	}

	const joinMatchingRoom = () => {
		const action = { type: 'JOIN', data: { player_name: playerName, room_id: roomId } }
		const action_base64 = btoa(JSON.stringify(action)).replaceAll('=', '')
		const ws = new WebSocket('ws://192.168.10.63:8080/matching', action_base64)
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameState])

	return (
		<div className='flex relative px-3 w-screen h-screen bg-slate-300'>
			{gameWs == null || gameState == null ? (
				<div className='flex flex-col gap-3 justify-center mx-auto w-[600px] max-w-full align-middle'>
					<div className='flex flex-col gap-3 p-6 bg-slate-100 rounded-xl shadow-xl'>
						<div className='py-3 font-mono text-3xl font-bold text-center'>
							<p className='text-slate-700'>4 COLOR REVERSI</p>
						</div>
						<div className='flex flex-col gap-3 md:flex-row'>
							<div className='flex flex-col flex-1 gap-1'>
								<label className='text-slate-700' htmlFor='player_name'>
									Player Name
								</label>
								<input
									className='py-2 px-3 text-slate-700 rounded-lg border-2 focus:outline-emerald-500'
									id='player_name'
									onChange={(e: ChangeEvent<HTMLInputElement>) => {
										setPlayerName(e.target.value)
									}}
									placeholder='name here'
									value={playerName}
								/>
							</div>
							<div className='flex flex-col flex-1 gap-1'>
								<label className='text-slate-700' htmlFor='match_id'>
									Match ID
								</label>
								<input
									className='py-2 px-3 text-slate-700 rounded-lg border-2 focus:outline-emerald-500'
									id='match_id'
									onChange={(e: ChangeEvent<HTMLInputElement>) => {
										setRoomId(e.target.value)
									}}
									placeholder='xxxx-xxxx-...'
									value={roomId}
								/>
							</div>
						</div>
						<div className='flex flex-col-reverse gap-3 md:flex-row'>
							<button
								className='py-3 font-mono text-sm text-slate-700 bg-slate-200 rounded-lg hover:opacity-80 active:opacity-100 transition-opacity duration-100 cursor-pointer md:p-3 md:text-xl md:text-white md:bg-orange-500'
								onClick={() => createMatchingRoom()}
							>
								CREATE ROOM
							</button>
							<hr className='border-slate-300 md:hidden'></hr>
							<button
								className='flex-1 p-3 w-full font-mono text-xl font-bold text-white bg-blue-600 rounded-lg hover:opacity-80 active:opacity-100 transition-opacity duration-100 cursor-pointer'
								onClick={() => joinMatchingRoom()}
							>
								JOIN ROOM !!
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className='m-auto w-full max-w-[70vh]'>
					<div className='flex flex-col gap-3 justify-center px-3 mx-auto max-w-full align-middle'>
						<div className='flex gap-3 pb-6'>
							<div
								className={`bg-slate-100 rounded-lg shadow-lg p-3 min-[100px] w-[30%] transition duration-100 ${
									is_my_turn ? 'scale-125' : 'bg-slate-200'
								}`}
							>
								<p className='text-xl text-center truncate'>
									{gameState.players[0].name}{' '}
									{gameState.players[0].name == playerName ? '(you)' : null}
								</p>
								<p className='font-mono font-bold text-center text-slate-700 md:text-2xl lg:text-3xl'>
									{gameState.score[0]}
								</p>
							</div>
							<div className='flex-1'></div>
							<div
								className={`bg-slate-100 rounded-lg shadow-lg p-3 min-[100px] w-[30%] transition duration-100 ${
									is_my_turn ? 'scale-125' : 'bg-slate-200'
								}`}
							>
								<p className='text-xl text-center truncate'>
									{gameState.players[1].name}{' '}
									{gameState.players[1].name == playerName ? '(you)' : null}
								</p>
								<p className='font-mono text-xl font-bold text-center text-slate-700'>
									{gameState.score[1]}
								</p>
							</div>
						</div>
						<Field
							executeAction={(action: SetAction | PassAction) => executeAction(action)}
							gameState={gameState}
							isMyTurn={is_my_turn}
						/>
					</div>
				</div>
			)}
		</div>
	)
}

export default Game
