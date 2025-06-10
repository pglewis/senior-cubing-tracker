import {readFile, writeFile} from "fs/promises";
import type {ExtendedRankingsData, WCAEventId} from "@repo/common/types/rankings-snapshot";

const RANKINGS_FILE = "../dist/data/senior-rankings.json";
const ENHANCED_FILE = "../dist/data/enhanced-rankings.json";

// Flattened result with all context pre-attached
interface FlatResult {
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
interface PersonProfile {
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

interface EnhancedRankingsData {
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

async function main(): Promise<void> {
	// Load the existing rankings data
	const rawData = await readFile(RANKINGS_FILE, "utf-8");
	const rankings: ExtendedRankingsData = JSON.parse(rawData);

	// Build enhanced data structures
	const enhancedData = buildEnhancedData(rankings);

	// Write the enhanced data
	await writeFile(ENHANCED_FILE, JSON.stringify(enhancedData, null, 0), "utf8");
	process.stdout.write("✅ Enhanced data structures created successfully.\n");
}

function buildEnhancedData(rankings: ExtendedRankingsData): EnhancedRankingsData {
	const results: FlatResult[] = [];
	const persons: {[personId: string]: PersonProfile;} = {};
	const competitions: {[id: number]: {id: number; webId: string; name: string; country: string; startDate: string;};} = {};
	const continents: {[id: string]: {id: string; name: string;};} = {};
	const countries: {[id: string]: {id: string; name: string; continent: string;};} = {};

	// Build ID-indexed data
	for (const competition of rankings.data.competitions) {
		competitions[competition.id] = {
			id: competition.id,
			webId: competition.webId,
			name: competition.name,
			country: competition.country,
			startDate: competition.startDate
		};
	}

	for (const continent of rankings.data.continents) {
		continents[continent.id] = {
			id: continent.id,
			name: continent.name
		};
	}

	for (const country of rankings.data.countries) {
		countries[country.id] = {
			id: country.id,
			name: country.name,
			continent: country.continent
		};
	}

	// Collect unique values for filter options
	const eventSet = new Set<WCAEventId>();
	const ageSet = new Set<number>();
	const countrySet = new Set<string>();
	const continentSet = new Set<string>();

	// First pass: Create all flat results with full context
	for (const event of rankings.data.events) {
		eventSet.add(event.id);

		for (const eventRanking of event.rankings) {
			const {age, type, ranks} = eventRanking;

			// Skip if no ranks
			if (ranks.length === 0) {
				continue;
			}

			ageSet.add(age);

			// Build regional rankings for this specific combination
			const regionalRankings = buildRegionalRankings(ranks, rankings);

			for (let i = 0; i < ranks.length; i++) {
				const rank = ranks[i];
				const person = rankings.data.persons[rankings.personIdToIndex[rank.id]];
				const country = rankings.data.countries[rankings.countryIdToIndex[person.country]];
				const continent = rankings.data.continents[rankings.continentIdToIndex[country.continent]];
				const competition = rankings.data.competitions[rankings.competitionIdToIndex[rank.competition]];

				countrySet.add(country.id);
				continentSet.add(continent.id);

				// Calculate ranks
				const worldRank = i + 1;
				const continentRank = regionalRankings.continents[continent.id]?.[person.id] || 0;
				const countryRank = regionalRankings.countries[country.id]?.[person.id] || 0;

				// Create flat result with all context
				const flatResult: FlatResult = {
					date: competition.startDate,
					eventId: event.id,
					type: type,
					age: age,
					result: rank.best,

					personId: person.id,

					competitionId: competition.id,

					countryId: country.id,
					continentId: continent.id,

					worldRank,
					continentRank,
					countryRank
				};

				results.push(flatResult);
			}
		}
	}

	// Sort results by date (newest first)
	results.sort((a, b) => b.date.localeCompare(a.date));

	// Second pass: Build person profiles with references to result indices
	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const person = rankings.data.persons[rankings.personIdToIndex[result.personId]];
		const country = rankings.data.countries[rankings.countryIdToIndex[person.country]];
		const continent = rankings.data.continents[rankings.continentIdToIndex[country.continent]];

		if (!persons[result.personId]) {
			persons[result.personId] = {
				personId: result.personId,
				name: person.name,
				countryId: country.id,
				continentId: continent.id,
				resultIndices: [],
				availableAges: [],
				availableEvents: []
			};
		}

		persons[result.personId].resultIndices.push(i);
	}

	// Third pass: Calculate available options for each person
	for (const personId in persons) {
		const person = persons[personId];
		const personAges = new Set<number>();
		const personEvents = new Set<WCAEventId>();

		for (const index of person.resultIndices) {
			const result = results[index];
			personAges.add(result.age);
			personEvents.add(result.eventId);
		}

		person.availableAges = Array.from(personAges).sort((a, b) => a - b);
		person.availableEvents = Array.from(personEvents);
	}

	return {
		lastUpdated: rankings.lastUpdated,
		results,
		persons,
		competitions,
		continents,
		countries
	};
}

function buildRegionalRankings(ranks: ExtendedRankingsData["data"]["events"][0]["rankings"][0]["ranks"], rankings: ExtendedRankingsData) {
	const continents: {[continentId: string]: {[personId: string]: number;};} = {};
	const countries: {[countryId: string]: {[personId: string]: number;};} = {};

	for (let i = 0; i < ranks.length; i++) {
		const rank = ranks[i];
		const person = rankings.data.persons[rankings.personIdToIndex[rank.id]];
		const country = rankings.data.countries[rankings.countryIdToIndex[person.country]];
		const continent = rankings.data.continents[rankings.continentIdToIndex[country.continent]];

		// Initialize continent tracking
		if (!continents[continent.id]) {
			continents[continent.id] = {};
		}
		if (!countries[country.id]) {
			countries[country.id] = {};
		}

		// Assign regional ranks (1-based, in order of appearance)
		if (!continents[continent.id]![person.id]) {
			continents[continent.id]![person.id] = Object.keys(continents[continent.id]!).length + 1;
		}
		if (!countries[country.id]![person.id]) {
			countries[country.id]![person.id] = Object.keys(countries[country.id]!).length + 1;
		}
	}

	return {continents, countries};
}

void main().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});