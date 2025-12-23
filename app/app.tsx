import {createBrowserRouter, RouterProvider, Outlet, Navigate} from "react-router";
import {ROUTES} from "@repo/app/routes";
import {ErrorHandler} from "./components/error/error-handler";
import {PageLayout} from "@repo/app/components/layout/page-layout";
import {Home} from "@repo/app/pages/home";
import {KinchRanks} from "./pages/kinch/kinch-ranks";
import {KinchRanksFaq} from "@repo/app/pages/kinch/kinch-ranks-faq";
import {CompetitorDataFaq} from "@repo/app/pages/competitor-data-faq";
import {PersonScoresPage} from "@repo/app/pages/kinch/person-scores-page";
import {Profile} from "@repo/app/pages/profile";
import {KinchProvider} from "@repo/app/features/kinch/context/kinch-provider";

// Get the basename from Vite's BASE_URL
// Remove trailing slash if present for React Router
const getBasename = () => {
	const base = import.meta.env.BASE_URL || "/";
	return base === "/" ? "" : base.replace(/\/$/, "");
};

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
				path: ROUTES.COMPETITOR_DATA_FAQ,
				element: <CompetitorDataFaq />
			}, {
				path: "/profile/:wcaid?",
				element: <Profile />
			}
		]
	}, {
		// Catch-all route for any undefined paths
		path: "*",
		element: <Navigate to={ROUTES.HOME} replace />
	}
], {
	basename: getBasename()
});

export function App() {
	return <RouterProvider router={router} />;
}