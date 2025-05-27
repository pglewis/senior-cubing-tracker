import {createBrowserRouter, RouterProvider, Outlet} from "react-router-dom";
import {PageLayout} from "@repo/app/components/layout/page-layout";
import {Home} from "@repo/app/pages/home";
import {Recent} from "@repo/app/pages/recent";
import {KinchRanks} from "@repo/app/pages/kinch-ranks/kinch-ranks";
import {KinchRanksFaq} from "@repo/app/pages/kinch-ranks/kinch-ranks-faq";
import {Results} from "@repo/app/pages/results";
import {KinchProvider} from "@repo/app/contexts/kinch-context";

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
				element: <KinchProvider>
					<Outlet />
				</KinchProvider>,
				children: [
					{
						index: true,
						element: <KinchRanks />
					},
					{
						path: "faq",
						element: <KinchRanksFaq />
					}
				]
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
