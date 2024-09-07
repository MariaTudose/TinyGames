export const n = 15;
export const getRandomPos = () => Math.ceil(Math.random() * (n - 1));
export const getRandomCoords = () => [getRandomPos(), getRandomPos()];
export const modN = (newPos: number) => ((((newPos - 1) % n) + n) % n) + 1;

const overlapsSnake = (newCoords: number[], coords: number[][]) =>
	coords.find(([y, x]) => y === newCoords[0] && x === newCoords[1]);
const tooClose = (newCoords: number[], coords: number[][]) =>
	Math.abs(coords[0][0] - newCoords[0]) <= 3 && Math.abs(coords[0][1] - newCoords[1]) <= 3;

export const getFoodCoords = (coords: number[][]) => {
	let newCoords: number[];
	do {
		newCoords = getRandomCoords();
	} while (overlapsSnake(newCoords, coords) || tooClose(newCoords, coords));
	return newCoords;
};
