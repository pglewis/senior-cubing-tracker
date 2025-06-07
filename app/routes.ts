export const ROUTES = {
	HOME: "/",
	RECENT: "/recent",
	KINCH_RANKS: "/kinch-ranks",
	KINCH_PERSON: "/kinch-ranks/:wcaid",
	KINCH_FAQ: "/kinch-ranks/faq",
	RESULTS: "/results",
} as const;

export const buildKinchPersonRoute = (wcaid: string) => `/kinch-ranks/${wcaid}`;
