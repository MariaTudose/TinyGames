import './ColorGrid.scss';

const colors = ['#ffc0cb', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#aff4fb', '#accbfd', '#c7bff8'];

interface ColorGirdProps {
	snakeColor: string;
	selectColor: (color: string) => void;
	setColorsSwapped: React.Dispatch<React.SetStateAction<boolean>>;
	muted: boolean;
	setMuted: (muted: boolean) => void;
}

const ColorGrid = ({ snakeColor, selectColor, setColorsSwapped, muted, setMuted }: ColorGirdProps) => (
	<div className="colorGrid">
		{colors.map((color) => (
			<div key={color} style={{ backgroundColor: color }} className={color} onClick={() => selectColor(color)}></div>
		))}
		<label className="colorPicker">
			<input type="color" value={snakeColor} onChange={(e) => selectColor(e.target.value)} />
		</label>
		<div onClick={() => setColorsSwapped((swap) => !swap)} className="reverse">
			{'\u21BB'}
		</div>
		<div onClick={() => setMuted(!muted)} className="sound">
			{muted ? '🔇' : '🔊'}
		</div>
	</div>
);

export default ColorGrid;
