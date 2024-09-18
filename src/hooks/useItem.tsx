import { useState } from 'react';

import { getFoodCoords } from '../components/Snake/utils';

export const useItem = (snakeCoords: number[][], snakeSpeed: number, className: string) => {
	const [coords, setCoords] = useState([0, 0]);

	const spawnItem = () => {
		const [y, x] = getFoodCoords(snakeCoords);
		const [snakeY, snakeX] = snakeCoords[0];
		const time = Math.max(2000, snakeSpeed * (Math.abs(snakeY - y) + Math.abs(snakeX - x)));
		setCoords([y, x]);
		setTimeout(() => {
			setCoords([0, 0]);
		}, time);
	};

	const element = (
		<div
			className={`${className} ${coords[0] === 0 && 'hidden'}`}
			style={{ gridArea: `${coords[0]} / ${coords[1]}` }}
		/>
	);

	return [coords, setCoords, spawnItem, element] as const;
};
