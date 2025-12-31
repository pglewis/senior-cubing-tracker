import {createBrowserRouter, Navigate} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import {KinchRouteLayout} from "@repo/app/routing/kinch-route-layout";
import {BASENAME} from "@repo/app/utils/basename";
import {ErrorHandler} from "@repo/app/components/error/error-handler";
import {PageLayout} from "@repo/app/components/layout/page-layout";
import {Home} from "@repo/app/pages/home";
import {KinchRanks} from "@repo/app/pages/kinch/kinch-ranks";
import {KinchRanksFaq} from "@repo/app/pages/kinch/kinch-ranks-faq";
import {CompetitorDataFaq} from "@repo/app/pages/competitor-data-faq";
import {PersonScoresPage} from "@repo/app/pages/kinch/person-scores-page";
import {Profile} from "@repo/app/pages/profile";

export const appRouter = createBrowserRouter([
	{
		path: ROUTES.HOME,
		element: <PageLayout />,
		errorElement: <ErrorHandler />,
		children: [
			{
				index: true,
				element: <Home />
			},
			{
				path: ROUTES.PROFILE,
				element: <Profile />
			},
			{
				path: ROUTES.PROFILE_PERSON,
				element: <Profile />
			},
			{
				path: ROUTES.KINCH_RANKS,
				element: <KinchRouteLayout />,
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
			},
			{
				path: ROUTES.COMPETITOR_DATA_FAQ,
				element: <CompetitorDataFaq />
			}
		]
	},
	{
		path: "*",
		element: <Navigate to={ROUTES.HOME} replace />
	}
], {
	basename: BASENAME
});
