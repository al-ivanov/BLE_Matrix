import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/RootLayout';
import { HomePage } from '@/pages/HomePage';
import { TextPage } from '@/pages/TextPage';
import { EqualizerPage } from '@/pages/EqualizerPage';
import { TerminalPage } from '@/pages/TerminalPage';

export const router = createBrowserRouter([
	{
		path: '/',
		element: <RootLayout />,
		children: [
			{ index: true, element: <HomePage /> },
			{ path: 'text', element: <TextPage /> },
			{ path: 'equalizer', element: <EqualizerPage /> },
			{ path: 'terminal', element: <TerminalPage /> },
		],
	},
]);
