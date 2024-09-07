import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, child, get, push, set } from 'firebase/database';

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
	const [leaderBoard, setLeaderBoard] = useState<Score[]>([]);

	const filterScores = (leaderBoard: Score[]) => {
		const newLeaderBoard = Object.values(
			leaderBoard.reduce<Record<string, Score>>((res, score) => {
				res[score.name] = res[score.name] && res[score.name].score > score.score ? res[score.name] : score;
				return res;
			}, {})
		);
		setLeaderBoard(newLeaderBoard.sort((a, b) => b.score - a.score).slice(0, 15));
	};

	// Populate leaderboard
	useEffect(() => {
		const dbRef = ref(getDatabase());
		get(child(dbRef, 'leaderboard'))
			.then((snapshot) => {
				if (snapshot.exists()) {
					const data = snapshot.toJSON();
					if (data) {
						filterScores(Object.values(data));
					}
				} else {
					console.log('No data available');
				}
			})
			.catch((error) => {
				console.error(error);
			});
	}, []);

	useEffect(() => {
		if (gameOver && inputRef.current) inputRef.current.focus();
	}, [gameOver]);

	const newHighScore = () => leaderBoard.length < 15 || Math.min(...leaderBoard.map((score) => score.score)) < score;

	const enterName = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setGameOver(false);
		if (newHighScore()) {
			const newScore = { name, score, timeStamp: new Date().toISOString() };
			const leaderboardRef = ref(getDatabase(), 'leaderboard');
			const newScoreRef = push(leaderboardRef);
			set(newScoreRef, newScore).then(() => {
				filterScores([newScore, ...leaderBoard]);
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
						maxLength={10}
					/>
				</label>
			</form>
		</div>
	);
};

export default Leaderboard;
