import { useCallback, useEffect, useRef, useState } from 'react';
import { getDatabase, ref, child, get, push, set } from 'firebase/database';
import { isSameWeek } from 'date-fns';
import { isSameWeekAsToday } from './utils';
import { useLocalStorage } from '../../hooks/useLocalStorage';

export type Score = {
	name: string;
	score: number;
	timestamp: string;
};

interface LeaderboardProps {
	setGameOver: (gameOver: boolean) => void;
	gameOver: boolean;
	gameStarted: boolean;
	score: number;
	setTitle: (title: string) => void;
	play: () => void;
}

const Leaderboard = ({ setGameOver, gameOver, gameStarted, score, setTitle, play }: LeaderboardProps) => {
	const [name, setName] = useState('');
	const [showNameInput, setShowNameInput] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const [leaderBoard, setLeaderBoard] = useState<Score[]>([]);
	const [savedName, setSavedName] = useLocalStorage('name', '');

	const filterScores = (leaderBoard: Score[]) => {
		const newLeaderBoard = Object.values(
			leaderBoard.reduce<Record<string, Score>>((res, score) => {
				res[score.name] = res[score.name] && res[score.name].score > score.score ? res[score.name] : score;
				return res;
			}, {})
		);
		return newLeaderBoard.sort((a, b) => b.score - a.score).slice(0, 10);
	};

	// Listen to arrow keys
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const { key } = e;
			if (key === ' ' && !gameStarted && !showNameInput) {
				e.preventDefault();
				play();
				setTitle('');
			}
			if (key === 'Escape') {
				setShowNameInput(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Populate leaderboard
	useEffect(() => {
		const dbRef = ref(getDatabase());
		get(child(dbRef, 'leaderboard'))
			.then((snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.toJSON();
					if (data) {
						setLeaderBoard(Object.values(data));
					}
				} else {
					console.log('No data available');
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	const updateScores = useCallback(
		(name: string) => {
			const newScore = { name, score, timestamp: new Date().toISOString() };
			const leaderboardRef = ref(getDatabase(), 'leaderboard');
			const newScoreRef = push(leaderboardRef);
			set(newScoreRef, newScore).then(() => {
				setLeaderBoard([newScore, ...leaderBoard]);
			});
		},
		[leaderBoard, score]
	);

	useEffect(() => {
		if (showNameInput && inputRef.current) inputRef.current.focus();
	}, [showNameInput]);

	// Check if high score
	useEffect(() => {
		const newHighScore = () => {
			const topWeek = filterScores(
				leaderBoard.filter((score) => isSameWeek(score.timestamp, new Date(), { weekStartsOn: 1 }))
			);
			if (savedName) {
				const previousScore = topWeek.find((score) => score.name === savedName);
				if (previousScore) return previousScore.score < score;
			}
			return topWeek.length < 10 || Math.min(...topWeek.map((score) => score.score)) < score;
		};

		if (gameOver && newHighScore()) {
			setTitle('New high score!!');
			setGameOver(false);
			if (savedName) updateScores(savedName);
			else setShowNameInput(true);
		} else if (gameOver) {
			setTitle('Game over');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [gameOver]);

	const enterName = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const trimmedName = name.trim();
		if (trimmedName.length > 0 && trimmedName.length <= 10) {
			setSavedName(name);
			updateScores(name);
			setShowNameInput(false);
		}
	};

	return (
		<div className="aside">
			<h2>Top 10 this week</h2>
			<table>
				<tbody>
					{filterScores(leaderBoard.filter(isSameWeekAsToday)).map((score, i) => (
						<tr key={i} className={score.name === savedName ? 'player' : ''}>
							<td>{score.name}</td>
							<td>{score.score}</td>
						</tr>
					))}
				</tbody>
			</table>
			<br />
			<h2>Top 10 all time</h2>
			<table>
				<tbody>
					{filterScores(leaderBoard).map((score, i) => (
						<tr key={i} className={score.name === savedName ? 'player' : ''}>
							<td>{score.name}</td>
							<td>{score.score}</td>
						</tr>
					))}
				</tbody>
			</table>
			<form className={`name ${showNameInput && 'visible'}`} onSubmit={enterName}>
				<h3>New high score!</h3>
				<label>
					Name:
					<input
						autoComplete="off"
						ref={inputRef}
						id="name"
						name="name"
						type="text"
						onInput={(e) => setName((e.target as HTMLInputElement).value)}
						value={name}
						maxLength={10}
						minLength={1}
					/>
				</label>
			</form>
		</div>
	);
};

export default Leaderboard;
