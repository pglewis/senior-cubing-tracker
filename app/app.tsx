import {createBrowserRouter, RouterProvider, Outlet, Navigate} from "react-router";
import {ROUTES} from "@repo/app/routes";
import {ErrorHandler} from "./components/error/error-handler";
import {PageLayout} from "@repo/app/components/layout/page-layout";
import {Home} from "@repo/app/pages/home";
import {Recent} from "@repo/app/pages/recent";
import {KinchRanks} from "./pages/kinch/kinch-ranks";
import {KinchRanksFaq} from "@repo/app/pages/kinch/kinch-ranks-faq";
import {PersonScoresPage} from "@repo/app/pages/kinch/person-scores-page";
import {Profile} from "@repo/app/pages/profile";
import {KinchProvider} from "@repo/app/features/kinch/context/kinch-provider";

const router = createBrowserRouter([
	{
		path: ROUTES.HOME,
		element: <PageLayout />,
		errorElement: <ErrorHandler />,
		children: [
			{
				index: true,
				element: <Home />
			}, {
				path: ROUTES.RECENT,
				element: <Recent />
			}, {
				path: ROUTES.KINCH_RANKS,
				element:
					<KinchProvider>
						<Outlet />
					</KinchProvider>,
				children: [
					{
						index: true,
						element: <KinchRanks />
					},
					{
						path: ":wcaid",
						element: <PersonScoresPage />
					},
					{
						path: "faq",
						element: <KinchRanksFaq />
					}
				]
			}, {
				path: ROUTES.PROFILE,
				element: <Profile />
			}
		]
	}, {
		// Catch-all route for any undefined paths
		path: "*",
		element: <Navigate to={ROUTES.HOME} replace />
	}
]);

export function App() {
	return <RouterProvider router={router} />;
}
