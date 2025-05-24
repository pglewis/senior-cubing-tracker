import {createBrowserRouter, RouterProvider} from 'react-router-dom';
import {PageLayout} from './components/layout/page-layout';
import {Home} from './pages/home';
import {Recent} from './pages/recent';
import {KinchRanks} from './pages/kinch-ranks';
import {Results} from './pages/results';

const router = createBrowserRouter([
	{
		path: "/",
		element: <PageLayout />,
		children: [
			{
				index: true,
				element: <Home />
			},
			{
				path: "recent",
				element: <Recent />
			},
			{
				path: "kinch-ranks",
				element: <KinchRanks />
			},
			{
				path: "results",
				element: <Results />
			}
		]
	}
]);

export function App() {
	return <RouterProvider router={router} />;
}
