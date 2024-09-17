import { Dispatch, SetStateAction, useState } from 'react';

import { getFoodCoords } from '../components/Snake/utils';

export const useItem = (
	snakeCoords: number[][],
	snakeSpeed: number
): [number[], Dispatch<SetStateAction<number[]>>, () => void] => {
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

	return [coords, setCoords, spawnItem];
};
