import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles/global.css';
import './styles/utilities.css';
import {App} from './app';

createRoot(document.getElementById('app')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
