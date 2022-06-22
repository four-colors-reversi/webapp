import { useState, useMemo, useEffect } from 'react'

import GameManager, { Player, Stone, Position } from '../utils/game'

import Field from './Field'

const Game = () => {
	const [players, setPlayers] = useState<Player[]>([
		new Player('p1', '#000000', '#0000ff'),
		new Player('p2', '#ff0000', '#00ff00'),
	])
	const [field, setField] = useState<Stone[][]>(GameManager.createInitialField(players))
	const [turn, setTurn] = useState<number>(1)

	const now_color = useMemo(() => GameManager.getTurnColor(turn, players), [turn, players])
	const [settablePositions, setSettablePositions] = useState<Position[]>(
		GameManager.getSettablePositions(field, now_color)
	)
	const scores = useMemo(() => {
		console.log(GameManager.calcScores(field, players))
		return GameManager.calcScores(field, players)
	}, [field])

	useEffect(() => {
		setField(GameManager.createInitialField(players))
	}, [players])

	useEffect(() => {
		const new_settable_positions = GameManager.getSettablePositions(field, now_color)
		if (new_settable_positions.length <= 0) {
			setTurn(turn + 1)
		} else {
			console.log(1)
			setSettablePositions(new_settable_positions)
		}
	}, [field, now_color])

	return (
		<div>
			<Field />
		</div>
	)
}

export default Game
