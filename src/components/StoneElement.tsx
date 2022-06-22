import { Stone } from '../utils/game'

interface Props {
	data: Stone
	settable: boolean
	onClick: Function
}

const StoneElement = (props: Props): JSX.Element => {
	const blackOrWhite = (hex: string): string => {
		if (hex[0] !== '#') return 'white'

		const r = parseInt(hex.slice(1, 3), 16)
		const g = parseInt(hex.slice(3, 4), 16)
		const b = parseInt(hex.slice(4, 6), 16)

		return (r * 299 + g * 587 + b * 114) / 1000 < 128 ? '#ffffff' : '#000000'
	}

	const base_props: React.HTMLAttributes<HTMLDivElement> = {
		className: 'w-8 h-8 border border-black border-solid',
		onClick: () => props.onClick(),
	}
	const base_stone_props: React.HTMLAttributes<HTMLDivElement> = {
		className: 'w-full h-full rounded-full flex justify-center items-center',
	}
	if (props.data.color !== null) {
		base_stone_props.style = {
			backgroundColor: props.data.color,
			color: blackOrWhite(props.data.color),
		}
	} else {
		if (props.settable) {
			base_props.style = {
				backgroundColor: '#ffff99',
			}
		}
	}
	return (
		<div {...base_props}>
			<div {...base_stone_props}>
				{props.data.value > 1 ? <span>{props.data.value}</span> : null}
			</div>
		</div>
	)
}

export default StoneElement
