import type {WCAEventId, EventRanking} from "@repo/common/types/rankings-snapshot";

export const scoreAverageOnly: Record<WCAEventId, boolean> = {
	"333": true,
	"222": true,
	"444": true,
	"555": true,
	"666": true,
	"777": true,
	"333bf": false,
	"333fm": false,
	"333oh": true,
	"clock": true,
	"minx": true,
	"pyram": true,
	"skewb": true,
	"sq1": true,
	"444bf": false,
	"555bf": false,
	"333mbf": false,
};

export interface TopRank {
	eventId: string,
	type: "single" | "average",
	age: number,
	region: string,
	result: string,
};

export interface KinchRank {
	personId: string,
	personName: string,
	overall: number,
	events: KinchEvent[],
};

export interface KinchEvent {
	eventId: WCAEventId,
	eventName: string,
	score: number,
	result: string,
	type: EventRanking["type"] | null,
};
