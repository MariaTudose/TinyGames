import { useEffect, useState } from 'react';
import './styles.scss';

enum Turn {
	X = 'X',
	O = 'O',
}

const emptyBoard = ['', '', '', '', '', '', '', '', ''];
const winRows = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

function TicTacToe() {
	const [turn, setTurn] = useState(Turn.X);
	const [winner, setWinner] = useState('');
	const [valueMatrix, setValueMatrix] = useState(emptyBoard);

	const makeTurn = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
		const target = e.currentTarget as HTMLInputElement;
		if (!target.value) {
			setValueMatrix((prev) => {
				const newArr = [...prev];
				newArr[Number(target.id)] = turn;
				return newArr;
			});
			setTurn((prev) => (prev === Turn.X ? Turn.O : Turn.X));
		}
	};

	const reset = () => {
		setValueMatrix(emptyBoard);
		setWinner('');
	};

	useEffect(() => {
		winRows.forEach((row) => {
			const winRow = row.reduce((sum, i) => sum + valueMatrix[i], '');
			if (winRow === 'XXX') {
				setWinner(Turn.X);
			}
			if (winRow === 'OOO') {
				setWinner(Turn.O);
			}
		});

		if (!valueMatrix.includes('')) alert(':(');
	}, [valueMatrix]);

	return (
		<div className={`tictactoe ${winner && 'winner'}`}>
			<h1 className={`header ${winner}`}>{winner} has won!!</h1>
			<div>
				<input type="text" id="0" onClick={makeTurn} value={valueMatrix[0]} readOnly />
				<input type="text" id="1" onClick={makeTurn} value={valueMatrix[1]} readOnly />
				<input type="text" id="2" onClick={makeTurn} value={valueMatrix[2]} readOnly />
			</div>
			<div>
				<input type="text" id="3" onClick={makeTurn} value={valueMatrix[3]} readOnly />
				<input type="text" id="4" onClick={makeTurn} value={valueMatrix[4]} readOnly />
				<input type="text" id="5" onClick={makeTurn} value={valueMatrix[5]} readOnly />
			</div>
			<div>
				<input type="text" id="6" onClick={makeTurn} value={valueMatrix[6]} readOnly />
				<input type="text" id="7" onClick={makeTurn} value={valueMatrix[7]} readOnly />
				<input type="text" id="8" onClick={makeTurn} value={valueMatrix[8]} readOnly />
			</div>
			<button onClick={reset}>reset</button>
		</div>
	);
}

export default TicTacToe;
