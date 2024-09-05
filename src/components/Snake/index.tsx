import { useCallback, useEffect, useRef, useState } from 'react';
import { getFoodCoords, modN, getRandomCoords } from './utils';
import Leaderboards from './Leaderboards';

import './styles.scss';

type Coordinates = number[][];

enum Direction {
	ArrowUp = 'ArrowUp',
	ArrowDown = 'ArrowDown',
	ArrowLeft = 'ArrowLeft',
	ArrowRight = 'ArrowRight',
	W = 'w',
	A = 'a',
	S = 's',
	D = 'd',
}

const opposites: Record<Direction, string> = {
	[Direction.ArrowUp]: 'ArrowDown',
	[Direction.ArrowDown]: 'ArrowUp',
	[Direction.ArrowLeft]: 'ArrowRight',
	[Direction.ArrowRight]: 'ArrowLeft',
	[Direction.W]: 's',
	[Direction.A]: 'd',
	[Direction.S]: 'w',
	[Direction.D]: 'a',
};

const verticalDir = ['ArrowDown', 'ArrowUp', 'w', 's'];
const startingSpeed = 300;
const scale = (Math.log(50) - Math.log(startingSpeed)) / (40 - 1);

const Snake = () => {
	const intervalRef = useRef<number>();
	const [gameOver, setGameOver] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [dir, setDir] = useState(Direction.ArrowRight);
	const [appleCoords, setAppleCoords] = useState(getRandomCoords());
	const [goldenCoords, setGoldenCoords] = useState([0, 0]);
	const [snakeLength, setSnakeLength] = useState(1);
	const [score, setScore] = useState(0);
	const [coords, setCoords] = useState([getRandomCoords()]);
	const [snakeSpeed, setSnakeSpeed] = useState(startingSpeed);

	useEffect(() => {
		// Speed up snake
		setSnakeSpeed(Math.exp(Math.log(startingSpeed) + scale * (snakeLength - 1)) + 50);

		// Spawn golden apple every 5 apples
		if (snakeLength > 1 && (snakeLength - 1) % 5 === 0) {
			setGoldenCoords(getFoodCoords(coords));
			setTimeout(() => {
				setGoldenCoords([0, 0]);
			}, 2000);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [snakeLength]);

	// Eat food
	useEffect(() => {
		const [yPos, xPos] = coords[0];
		if (yPos === appleCoords[0] && xPos === appleCoords[1]) {
			setSnakeLength((length) => length + 1);
			setScore((score) => score + 1);
			setAppleCoords(getFoodCoords(coords));
		}

		if (yPos === goldenCoords[0] && xPos === goldenCoords[1]) {
			setSnakeLength((length) => length + 1);
			setScore((score) => score + 5);
			setGoldenCoords([0, 0]);
		}
	}, [appleCoords, coords, goldenCoords]);

	const checkCollisions = useCallback((coords: Coordinates, yPos: number, xPos: number) => {
		if (coords.slice(0, -1).find(([y, x]) => y === yPos && x === xPos)) {
			console.log('coords', coords, xPos, yPos);
			setGameStarted(false);
			setGameOver(true);
			clearInterval(intervalRef.current);
			return true;
		}
	}, []);

	const getNewCoords = useCallback(
		(coords: Coordinates, yDir: number, xDir: number) => {
			const yPos = modN(coords[0][0] + yDir);
			const xPos = modN(coords[0][1] + xDir);
			if (!checkCollisions(coords, yPos, xPos)) {
				return [[yPos, xPos], ...coords.slice(0, snakeLength)];
			} else return coords;
		},
		[checkCollisions, snakeLength]
	);

	const handleMove = useCallback(
		(key: string) => {
			if (key === 'ArrowLeft' || key === 'a') {
				setCoords((coords) => getNewCoords(coords, 0, -1));
			}
			if (key === 'ArrowRight' || key === 'd') {
				setCoords((coords) => getNewCoords(coords, 0, 1));
			}
			if (key === 'ArrowDown' || key === 's') {
				setCoords((coords) => getNewCoords(coords, 1, 0));
			}
			if (key === 'ArrowUp' || key === 'w') {
				setCoords((coords) => getNewCoords(coords, -1, 0));
			}
		},
		[getNewCoords]
	);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const { key } = e;
			const isArrowKey = Object.values(Direction).includes(key as Direction);
			console.log('isArrowKey', isArrowKey, key);
			if (!gameStarted && !gameOver && key === ' ') startGame();
			if (gameStarted && isArrowKey) {
				e.preventDefault();
				if (opposites[dir] !== key) {
					setDir(e.key as Direction);
					handleMove(e.key);
				}
			}
		},
		[dir, gameOver, gameStarted, handleMove]
	);

	// Listen to arrow keys
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [gameStarted, handleKeyDown]);

	// Game ticks
	useEffect(() => {
		if (gameStarted) {
			intervalRef.current = setInterval(() => handleMove(dir), snakeSpeed);
			return () => clearInterval(intervalRef.current);
		}
	}, [handleMove, gameStarted, snakeSpeed, dir]);

	const startGame = () => {
		setScore(0);
		setSnakeLength(1);
		setGameOver(false);
		setGameStarted(true);
		setSnakeSpeed(startingSpeed);
		setCoords([getRandomCoords()]);
	};

	return (
		<div className="snakeContainer">
			<h1 className={`snakeHeader ${gameOver}`}>{`Game over`}</h1>
			<h4 className="score">{`Score: ${score}`}</h4>
			<div className="gameGrid" tabIndex={0}>
				{Array.from(Array(snakeLength).keys()).map((snakeL) => {
					if (coords.length > snakeL) {
						const newYPos = coords[snakeL][0];
						const newXPos = coords[snakeL][1];
						return (
							<div
								key={snakeL}
								className={`snake snake${snakeL}`}
								style={{
									gridArea: `${newYPos} / ${newXPos}`,
									transform: `rotate(${verticalDir.includes(dir) ? 90 : 0}deg)`,
								}}
							></div>
						);
					}
				})}
				<div className="food" style={{ gridArea: `${appleCoords[0]} / ${appleCoords[1]}` }}></div>
				<div
					className={`goldenFood ${goldenCoords[0] === 0 && 'hidden'}`}
					style={{ gridArea: `${goldenCoords[0]} / ${goldenCoords[1]}` }}
				></div>
			</div>
			<div>
				<button className="startButton" onClick={startGame}>
					start
				</button>
				<button className="startButton" onClick={() => setGameStarted(false)}>
					stop
				</button>
			</div>
			<Leaderboards setGameOver={(status) => setGameOver(status)} gameOver={gameOver} score={score} />
		</div>
	);
};

export default Snake;
