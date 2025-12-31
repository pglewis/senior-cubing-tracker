export const ROUTES = {
	HOME: "/",
	KINCH_RANKS: "/kinch-ranks",
	KINCH_PERSON: "/kinch-ranks/:wcaid",
	KINCH_FAQ: "/kinch-ranks/faq",
	COMPETITOR_DATA_FAQ: "/competitor-data-faq",
	PROFILE: "/profile/",
} as const;

export const buildKinchPersonRoute = (wcaid: string) => `${ROUTES.KINCH_RANKS}/${wcaid}`;
export const buildProfileRoute = (wcaid: string) => `${ROUTES.PROFILE}${wcaid}`;
