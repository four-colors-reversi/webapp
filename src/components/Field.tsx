import GameManager, { Position } from '../utils/game'

import { GameState } from './Game'
import StoneElement from './StoneElement'

interface Props {
	gameState: GameState
	executeAction: Function
	isMyTurn: boolean
}

const Field = (props: Props) => {
	const now_color: string = GameManager.getTurnColor(props.gameState.turn, props.gameState.players)

	const settablePositions = GameManager.getSettablePositions(props.gameState.field, now_color)

	const stones: JSX.Element[] = []
	for (let y = 0; y < props.gameState.field[0].length; y++) {
		const stone_line: JSX.Element[] = []
		for (let x = 0; x < props.gameState.field.length; x++) {
			stone_line.push(
				<StoneElement
					data={props.gameState.field[x][y]}
					key={`${x}_${y}`}
					onClick={() => {
						props.executeAction({ type: 'SET', data: { position: { x: x, y: y } } })
					}}
					settable={settablePositions.some((p: Position) => p.x == x && p.y == y)}
				/>
			)
		}
		stones.push(
			<div className='flex flex-row' key={stones.length}>
				{stone_line}
			</div>
		)
	}

	return (
		<div
			className='flex flex-col w-full h-full bg-slate-100 border-4 border-slate-500 border-solid ring-2 ring-slate-400 shadow-md'
			style={props.isMyTurn ? {} : { filter: 'grayscale(0.3)' }}
		>
			{stones}
		</div>
	)
}

export default Field
