import { useMemo } from 'react'

import GameManager, { Player, Position, Stone } from '../utils/game'

import StoneElement from './StoneElement'

interface Props {
	field: Stone[][]
	players: Player[]
}

const Field = (props: Props) => {
	const stones: JSX.Element[] = useMemo(() => {
		const new_stones: JSX.Element[] = []
		for (let y = 0; y < props.field[0].length; y++) {
			const stone_line: JSX.Element[] = []
			for (let x = 0; x < props.field.length; x++) {
				stone_line.push(
					<StoneElement
						data={props.field[x][y]}
						key={`${x}_${y}`}
						onClick={() => {
							if (GameManager.setStone(props.field, props.players, { x: x, y: y }, now_color)) {
								setField(props.field)
								setTurn(turn + 1)
							}
						}}
						settable={settablePositions.some((p: Position) => p.x == x && p.y == y)}
					/>
				)
			}
			new_stones.push(<div className='flex flex-row'>{stone_line}</div>)
		}
		return new_stones
	}, [field, players, now_color, settablePositions])

	return <div className='flex flex-col w-fit h-fit border border-black border-solid'>{stones}</div>
}

export default Field
