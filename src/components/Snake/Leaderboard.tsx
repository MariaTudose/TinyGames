import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Score = {
	name: string;
	score: number;
};

interface LeaderboardProps {
	setGameOver: (gameOver: boolean) => void;
	gameOver: boolean;
	score: number;
}

const Leaderboard = ({ setGameOver, gameOver, score }: LeaderboardProps) => {
	const [name, setName] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);
	const { value, setItem } = useLocalStorage<Score[]>('scores', []);
	const [leaderBoard, setLeaderBoard] = useState<Score[]>([]);

	// Populate leaderboard
	useEffect(() => {
		if (value) setLeaderBoard(value);
	}, [value]);

	useEffect(() => {
		if (gameOver && inputRef.current) inputRef.current.focus();
	}, [gameOver]);

	const newHighScore = () => Math.min(...leaderBoard.map((score) => score.score)) < score;

	const enterName = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setGameOver(false);
		if (leaderBoard.length < 10 || newHighScore()) {
			setLeaderBoard((leaderBoard) => {
				const newLeaderBoard = [{ name, score }, ...leaderBoard];
				if (newLeaderBoard.length > 10) newLeaderBoard.sort((a, b) => b.score - a.score).pop();
				setItem(newLeaderBoard);
				return newLeaderBoard;
			});
		}
	};

	return (
		<div className="aside">
			<h2>Leaderboard</h2>
			<table>
				<tbody>
					{leaderBoard
						.sort((a, b) => b.score - a.score)
						.map((score, i) => (
							<tr key={i}>
								<td>{score.name}</td>
								<td>{score.score}</td>
							</tr>
						))}
				</tbody>
			</table>
			<form className={`name ${gameOver && newHighScore() && 'visible'}`} onSubmit={enterName}>
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
					/>
				</label>
			</form>
		</div>
	);
};

export default Leaderboard;
