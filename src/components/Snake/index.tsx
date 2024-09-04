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
}

const opposites: Record<Direction, string> = {
	[Direction.ArrowUp]: 'ArrowDown',
	[Direction.ArrowDown]: 'ArrowUp',
	[Direction.ArrowLeft]: 'ArrowRight',
	[Direction.ArrowRight]: 'ArrowLeft',
};

const verticalDir = ['ArrowDown', 'ArrowUp'];

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
	const [snakeSpeed, setSnakeSpeed] = useState(400);

	useEffect(() => {
		// Speed up game every 2 apples
		if (snakeLength % 2 === 0) {
			setSnakeSpeed((snakeSpeed) => snakeSpeed * 0.9);
		}

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

	const handleKeyDown = (e: KeyboardEvent) => {
		const { key } = e;
		if (gameStarted && Object.values(Direction).includes(key as Direction)) e.preventDefault();
		if (gameStarted && opposites[dir] !== key) {
			setDir(e.key as Direction);
			handleMove(e.key);
		}
	};

	// Listen to arrow keys
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameStarted, dir]);

	const checkCollisions = useCallback((coords: Coordinates, yPos: number, xPos: number) => {
		if (coords.slice(0, -1).find(([y, x]) => y === yPos && x === xPos)) {
			console.log('coords', coords, xPos, yPos);
			setGameStarted(false);
			setGameOver(true);
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
			if (key === 'ArrowLeft') {
				setCoords((coords) => getNewCoords(coords, 0, -1));
			}
			if (key === 'ArrowRight') {
				setCoords((coords) => getNewCoords(coords, 0, 1));
			}
			if (key === 'ArrowDown') {
				setCoords((coords) => getNewCoords(coords, 1, 0));
			}
			if (key === 'ArrowUp') {
				setCoords((coords) => getNewCoords(coords, -1, 0));
			}
		},
		[getNewCoords]
	);

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
		setSnakeSpeed(400);
		setGameStarted(true);
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
					} else {
						console.log('not possible!!', coords, snakeLength);
						setGameStarted(false);
						setGameOver(true);
						return <div></div>;
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
