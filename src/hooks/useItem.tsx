import { useState } from 'react';

import { getItemCoords, modN } from '../components/Snake/utils';

const adjacentEdges = (v: number[]) => {
	const [y, x] = v;
	return [
		[modN(y + 1), x],
		[modN(y - 1), x],
		[y, modN(x + 1)],
		[y, modN(x - 1)],
	];
};

type Node = {
	coord: number[];
	parent: number[][];
};

const overlaps = (coords: number[][], coord: number[]) => coords.find((c) => c.join('') === coord.join(''));

const findPath = (snakeCoords: number[][], headCoord: number[], itemCoord: number[]) => {
	const queue: Node[] = [{ coord: headCoord, parent: [] }];
	const visited: number[][] = [headCoord];
	while (queue.length > 0) {
		const { coord, parent } = queue.shift() as Node;
		if (coord[0] === itemCoord[0] && coord[1] === itemCoord[1]) return [...parent, coord];
		for (let i = 0; i < 4; i++) {
			const newCoord = adjacentEdges(coord)[i];
			if (!overlaps(snakeCoords, newCoord) && !overlaps(visited, newCoord)) {
				visited.push(newCoord);
				queue.push({ coord: newCoord, parent: [...parent, coord] });
			}
		}
	}
};

export const useItem = (
	snakeCoords: number[][],
	snakeSpeed: number,
	className: string,
	setPath: (path: number[][]) => void
) => {
	const [coords, setCoords] = useState([0, 0]);
	const spawnItem = () => {
		const itemCoords = getItemCoords(snakeCoords);
		const shortestPath = findPath(snakeCoords, snakeCoords[0], itemCoords);
		if (shortestPath) setPath(shortestPath);
		const time = Math.max(2000, snakeSpeed * (shortestPath?.length || 0));
		setCoords(itemCoords);
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
