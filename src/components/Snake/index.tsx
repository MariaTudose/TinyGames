import { useCallback, useEffect, useRef, useState } from 'react';
import { useSound } from 'use-sound';
import cx from 'classnames';
import {
	getFoodCoords,
	modN,
	getRandomCoords,
	getRandomColor,
	checkNeighbors,
	blinkInterval,
	getTimeDiff,
} from './utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import Leaderboards from './Leaderboard';
import poison from '../../static/sounds/poisoned.mp3';
import crunch from '../../static/sounds/crunch.mp3';
import golden from '../../static/sounds/golden.wav';
import star from '../../static/sounds/star.mp3';
import { useItem } from '../../hooks/useItem';

import './styles.scss';

type Coordinates = number[][];

enum SpecialItem {
	Star,
	Shroom,
}

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
const scale = (Math.log(60) - Math.log(startingSpeed)) / (40 - 1);
const colors = ['#ffc0cb', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#aff4fb', '#accbfd', '#c7bff8'];
const backgroundColor = '#242424';

const Snake = () => {
	const intervalRef = useRef<number>();
	const [nextItem, setNextItem] = useState(SpecialItem.Star);

	// Game status
	const [title, setTitle] = useState('');
	const [gameOver, setGameOver] = useState(false);
	const [gameStarted, setGameStarted] = useState(false);
	const [score, setScore] = useState(0);
	const [timeStarted, setTimeStarted] = useState<Date>(new Date());
	const { setItem: setName } = useLocalStorage('name', '');

	// Snake properties
	const [snakeLength, setSnakeLength] = useState(1);
	const [snakeSpeed, setSnakeSpeed] = useState(startingSpeed);
	const [poisoned, setPoisoned] = useState(false);
	const [invincible, setInvincible] = useState(false);

	// Coordinates
	const [dir, setDir] = useState(Direction.ArrowRight);
	const [coords, setCoords] = useState([[8, 8]]);
	const [appleCoords, setAppleCoords] = useState(getRandomCoords());
	const [goldenCoords, setGoldenCoords, spawnGolden] = useItem(coords, snakeSpeed);
	const [shroomCoords, setShroomCoords, spawnShroom] = useItem(coords, snakeSpeed);
	const [starCoords, setStarCoords, spawnStar] = useItem(coords, snakeSpeed);

	// Colors
	const { value, setItem } = useLocalStorage('color', colors[0]);
	const [snakeColor, setSnakeColor] = useState(colors[0]);
	const [colorsSwapped, setColorsSwapped] = useState(false);

	// Sound
	const { value: muted, setItem: setMuted } = useLocalStorage('muted', false);
	const [poisonAudio] = useSound(poison, { volume: muted ? 0 : 1 });
	const [goldenAudio] = useSound(golden, { volume: muted ? 0 : 1 });
	const [foodAudio] = useSound(crunch, { playbackRate: 1 + Math.random(), volume: muted ? 0 : 1 });
	const [playStar] = useSound(star, { volume: muted ? 0 : 0.15 });

	const selectColor = (color: string) => {
		setItem(color);
		setSnakeColor(color);
	};

	useEffect(() => {
		if (value) setSnakeColor(value);
	}, [value]);

	useEffect(() => {
		// Speed up snake
		if (!poisoned) {
			setSnakeSpeed(Math.exp(Math.log(startingSpeed) + scale * (snakeLength - 1)) + 60);
		}

		// Spawn shroom or star
		if (!poisoned && !invincible && shroomCoords[0] === 0 && starCoords[0] === 0 && snakeLength % 7 === 0) {
			if (nextItem === SpecialItem.Shroom) spawnShroom();
			else spawnStar();
			setNextItem(Math.round(Math.random()));
		}

		// Spawn golden apple every 5 apples
		if (snakeLength > 1 && (snakeLength - 1) % 5 === 0) {
			spawnGolden();
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
			foodAudio();
		}

		if (yPos === goldenCoords[0] && xPos === goldenCoords[1]) {
			setSnakeLength((length) => length + 1);
			setScore((score) => score + 5);
			setGoldenCoords([0, 0]);
			goldenAudio();
		}

		if (yPos === shroomCoords[0] && xPos === shroomCoords[1]) {
			const previousColor = snakeColor;
			setPoisoned(true);
			setShroomCoords([0, 0]);
			setSnakeSpeed((snakeSpeed) => snakeSpeed * 1.4);
			setScore((score) => score + 3);
			poisonAudio();

			const interval = setInterval(() => {
				setSnakeColor(getRandomColor());
			}, snakeSpeed);

			setTimeout(() => {
				setPoisoned(false);
				clearInterval(interval);
				setSnakeColor(previousColor);
			}, 6000);
		}

		if (yPos === starCoords[0] && xPos === starCoords[1]) {
			playStar();
			setInvincible(true);
			setStarCoords([0, 0]);
			const currentColor = snakeColor;
			const slowBlink = blinkInterval(setSnakeColor, currentColor, 250);

			setTimeout(() => {
				clearInterval(slowBlink);
				const fastBlink = blinkInterval(setSnakeColor, currentColor, 50);

				setTimeout(() => {
					clearInterval(fastBlink);
				}, 2000);
			}, 6000);

			setTimeout(() => {
				setInvincible(false);
				setSnakeColor(currentColor);
			}, 8100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [appleCoords, coords, goldenCoords, snakeColor, shroomCoords, snakeSpeed, muted, starCoords]);

	const checkCollisions = useCallback((coords: Coordinates, yPos: number, xPos: number) => {
		if (coords.slice(0, -1).find(([y, x]) => y === yPos && x === xPos)) {
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
			if (invincible || !checkCollisions(coords, yPos, xPos)) {
				return [[yPos, xPos], ...coords.slice(0, snakeLength - 1)];
			} else return coords;
		},
		[checkCollisions, invincible, snakeLength]
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
			if (gameStarted && isArrowKey) {
				e.preventDefault();
				if (opposites[dir] !== key) {
					setDir(e.key as Direction);
					handleMove(e.key);
				}
			}
		},
		[dir, gameStarted, handleMove]
	);

	// Listen to arrow keys
	useEffect(() => {
		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, [handleKeyDown]);

	// Game ticks
	useEffect(() => {
		if (gameStarted) {
			intervalRef.current = window.setInterval(() => handleMove(dir), snakeSpeed);
			return () => clearInterval(intervalRef.current);
		}
	}, [handleMove, gameStarted, snakeSpeed, dir]);

	const startGame = () => {
		setScore(0);
		setTitle('');
		setSnakeLength(1);
		setGameOver(false);
		setCoords([[8, 8]]);
		setGameStarted(true);
		setTimeStarted(new Date());
		setDir(Direction.ArrowRight);
		setSnakeSpeed(startingSpeed);
	};

	return (
		<div className="snakeContainer">
			<h1 className="snakeHeader">{title}</h1>
			<div className="stats">
				<h4>{`Score: ${score}`}</h4>
				<h4>{`Length: ${snakeLength}`}</h4>
				<h4>{`Time: ${getTimeDiff(timeStarted)}`}</h4>
			</div>
			<div className="flexRow">
				<div
					className="gameGrid"
					tabIndex={0}
					style={{
						border: `1px solid ${snakeColor}`,
						backgroundColor: colorsSwapped ? snakeColor : backgroundColor,
					}}
				>
					{coords.map(([yPos, xPos], i) => (
						<div
							key={i}
							className={cx('snake', {
								head: i === 0,
								rotate: verticalDir.includes(dir),
								colorsSwapped,
								...checkNeighbors(coords, yPos, xPos, i),
							})}
							style={{
								zIndex: snakeLength - i,
								gridArea: `${yPos} / ${xPos}`,
								backgroundColor: colorsSwapped ? backgroundColor : snakeColor,
							}}
						/>
					))}
					<div className="food" style={{ gridArea: `${appleCoords[0]} / ${appleCoords[1]}` }}></div>
					<div
						className={`goldenFood ${goldenCoords[0] === 0 && 'hidden'}`}
						style={{ gridArea: `${goldenCoords[0]} / ${goldenCoords[1]}` }}
					/>
					<div
						className={`shroom ${shroomCoords[0] === 0 && 'hidden'}`}
						style={{ gridArea: `${shroomCoords[0]} / ${shroomCoords[1]}` }}
					/>
					<div
						className={`star ${starCoords[0] === 0 && 'hidden'}`}
						style={{ gridArea: `${starCoords[0]} / ${starCoords[1]}` }}
					/>
				</div>
				<div className="colorGrid">
					{colors.map((color) => (
						<div
							key={color}
							style={{ backgroundColor: color }}
							className={color}
							onClick={() => selectColor(color)}
						></div>
					))}
					<label className="colorPicker">
						<input type="color" value={snakeColor} onChange={(e) => setSnakeColor(e.target.value)} />
					</label>
					<div onClick={() => setColorsSwapped((swap) => !swap)} className="reverse">
						{'\u21BB'}
					</div>
					<div onClick={() => setMuted(!muted)} className="sound">
						{muted ? '🔇' : '🔊'}
					</div>
				</div>
			</div>
			<div>
				<button className="startButton" onClick={startGame}>
					start
				</button>
				<button
					onClick={() => {
						setName('');
						window.location.reload();
					}}
				>
					reset name
				</button>
			</div>
			<Leaderboards
				setGameOver={(status) => setGameOver(status)}
				gameOver={gameOver}
				gameStarted={gameStarted}
				score={score}
				setTitle={setTitle}
				startGame={startGame}
			/>
		</div>
	);
};

export default Snake;
