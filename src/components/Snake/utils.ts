import { differenceInMinutes, differenceInSeconds, isSameWeek } from 'date-fns';
import { Score } from './Leaderboard';

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

export const getRandomColor = () => {
	const hue = 360 * Math.random();
	const saturation = 30 + 40 * Math.random();
	const lightness = 70 + 10 * Math.random();
	return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const isSameWeekAsToday = (score: Score) => isSameWeek(score.timestamp, new Date(), { weekStartsOn: 1 });

export const checkNeighbors = (coords: number[][], yPos: number, xPos: number, i: number) => {
	const [prevY, prevX] = i === 0 ? coords[i] : coords[i - 1];
	const [nextY, nextX] = i + 1 === coords.length ? coords[i] : coords[i + 1];
	const hasTopNeighbor = (prevY === yPos - 1 && prevX === xPos) || (nextY === yPos - 1 && nextX === xPos);
	const hasLeftNeighbor = (prevY === yPos && prevX === xPos - 1) || (nextY === yPos && nextX === xPos - 1);
	const hasBottomNeighbor = (prevY === yPos + 1 && prevX === xPos) || (nextY === yPos + 1 && nextX === xPos);
	const hasRightNeighbor = (prevY === yPos && prevX === xPos + 1) || (nextY === yPos && nextX === xPos + 1);

	return { hasTopNeighbor, hasLeftNeighbor, hasBottomNeighbor, hasRightNeighbor };
};

export const blinkInterval = (setSnakeColor: (color: string) => void, color: string, duration: number) => {
	let counter = 0;
	const interval = setInterval(() => {
		counter += 1;
		if (counter % 2 === 0) setSnakeColor(color);
		else setSnakeColor('#fff');
	}, duration);

	return interval;
};

export const getTimeDiff = (timeStarted: Date) => {
	const minutes = String(differenceInMinutes(new Date(), timeStarted)).padStart(2, '0');
	const seconds = String(differenceInSeconds(new Date(), timeStarted) % 60).padStart(2, '0');
	return `${minutes}:${seconds}`;
};
