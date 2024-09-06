import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App.tsx';

import './styles/base.scss';

import { initializeApp } from 'firebase/app';

const firebaseConfig = {
	databaseURL: 'https://tinygames-e1154-default-rtdb.europe-west1.firebasedatabase.app/',
};

initializeApp(firebaseConfig);

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
);
