import { useState } from 'react';
import TicTacToe from './TicTacToe';
import Snake from './Snake';

import './App.scss';

function App() {
	const [playingGame, setPlayingGame] = useState(1);

	return (
		<>
			<header>
				<button className="gameButton" onClick={() => setPlayingGame(0)}>
					TicTacToe
				</button>
				<button className="gameButton" onClick={() => setPlayingGame(1)}>
					Snake
				</button>
			</header>
			{playingGame === 0 && <TicTacToe />}
			{playingGame === 1 && <Snake />}
		</>
	);
}

export default App;
