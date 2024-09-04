export const n = 15;
export const getRandomPos = () => Math.ceil(Math.random() * (n - 1));
export const getRandomCoords = () => [getRandomPos(), getRandomPos()];
export const modN = (newPos: number) => ((((newPos - 1) % n) + n) % n) + 1;

export const getFoodCoords = (coords: number[][]) => {
	let newCoords: number[];
	do {
		newCoords = getRandomCoords();
	} while (coords.find(([y, x]) => y === newCoords[0] && x === newCoords[1]));
	return newCoords;
};
