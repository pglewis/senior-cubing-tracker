export const ROUTES = {
	HOME: "/",
	PROFILE: "/profile",
	PROFILE_PERSON: "/profile/:wcaid",
	KINCH_RANKS: "/kinch-ranks",
	KINCH_PERSON: "/kinch-ranks/:wcaid",
	KINCH_FAQ: "/kinch-ranks/faq",
	COMPETITOR_DATA_FAQ: "/competitor-data-faq",
} as const;

export const buildProfilePersonRoute = (wcaid: string) => `${ROUTES.PROFILE}/${wcaid}`;
export const buildKinchPersonRoute = (wcaid: string) => `${ROUTES.KINCH_RANKS}/${wcaid}`;
