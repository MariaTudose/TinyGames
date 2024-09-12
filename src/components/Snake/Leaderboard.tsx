import { useEffect, useRef, useState } from 'react';
import { getDatabase, ref, child, get, push, set } from 'firebase/database';
import { isSameWeek } from 'date-fns';

type Score = {
	name: string;
	score: number;
	timestamp: string;
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
		setLeaderBoard(newLeaderBoard.sort((a, b) => b.score - a.score));
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

	const newHighScore = () => {
		const topWeek = leaderBoard.filter((score) => isSameWeek(score.timestamp, new Date(), { weekStartsOn: 1 }));
		return topWeek.length < 10 || Math.min(...topWeek.map((score) => score.score)) < score;
	};

	const enterName = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setGameOver(false);
		if (newHighScore()) {
			const newScore = { name, score, timestamp: new Date().toISOString() };
			const leaderboardRef = ref(getDatabase(), 'leaderboard');
			const newScoreRef = push(leaderboardRef);
			set(newScoreRef, newScore).then(() => {
				filterScores([newScore, ...leaderBoard]);
			});
		}
	};

	return (
		<div className="aside">
			<h2>Top 10 this week</h2>
			<table>
				<tbody>
					{leaderBoard
						.filter((score) => isSameWeek(score.timestamp, new Date(), { weekStartsOn: 1 }))
						.sort((a, b) => b.score - a.score)
						.slice(0, 10)
						.map((score, i) => (
							<tr key={i}>
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
					{leaderBoard
						.sort((a, b) => b.score - a.score)
						.slice(0, 10)
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
