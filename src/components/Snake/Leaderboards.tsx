import { useEffect, useState } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Score = {
	name: string;
	score: number;
};

interface LeaderboardsProps {
	setGameOver: (gameOver: boolean) => void;
	gameOver: boolean;
	score: number;
}

const Leaderboards = ({ setGameOver, gameOver, score }: LeaderboardsProps) => {
	const [name, setName] = useState('');
	const { value, setItem } = useLocalStorage<Score[]>('scores', []);
	const [leaderBoard, setLeaderBoard] = useState<Score[]>([]);

	useEffect(() => {
		if (value) setLeaderBoard(value);
	}, [value]);

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
			<h2>Leaderboards</h2>
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
			<form className={`name ${gameOver && 'visible'}`} onSubmit={enterName}>
				<h3>New high score!</h3>
				<label>
					Name:
					<input
						autoComplete="off"
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

export default Leaderboards;
