import type {WCAEventId} from "./rankings-snapshot";

// Flattened result with all context pre-attached
export interface FlatResult {
	// Result details
	date: string;
	eventId: WCAEventId;
	type: "single" | "average";
	age: number;
	result: string;

	// Person details (denormalized)
	personId: string;

	// Competition details (denormalized)
	competitionId: number;

	// Geographic details (denormalized)
	countryId: string;
	continentId: string;

	// Rankings (calculated once)
	worldRank: number;
	continentRank: number;
	countryRank: number;
}

// Person-centric structure focused on easy access
export interface PersonProfile {
	// Basic info
	personId: string;
	name: string;
	countryId: string;
	continentId: string;

	// All their results (reference to flat results by index)
	resultIndices: number[];

	// Available filter options for this person
	availableAges: number[];
	availableEvents: WCAEventId[];
}

export interface EnhancedRankingsData {
	// Metadata
	lastUpdated: string;

	// Flattened results - single source of truth, pre-sorted by date (newest first)
	results: FlatResult[];

	// Person lookup and profiles
	persons: {
		[personId: string]: PersonProfile;
	};

	// Competition data as ID-indexed objects for O(1) lookups
	competitions: {
		[id: number]: {
			id: number;
			webId: string;
			name: string;
			country: string;
			startDate: string;
		};
	};

	// Geographic data as ID-indexed objects for O(1) lookups
	continents: {
		[id: string]: {
			id: string;
			name: string;
		};
	};
	countries: {
		[id: string]: {
			id: string;
			name: string;
			continent: string;
		};
	};
}