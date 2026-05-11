import {writeFile, mkdir} from "node:fs/promises";
import {createContext, runInContext} from "node:vm";
import type {Missing, Rank, RankingsSnapshot, WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {EnhancedRankingsData, FlatResult, PersonProfile} from "@repo/common/types/enhanced-rankings";
import {buildTopRanks} from "./create-topranks.ts";
import {DATA_FILENAME} from "@repo/common/data-constants";

const RANKINGS_URL = "https://wca-seniors.org/data/Senior_Rankings.js";
const DESTINATION_DIR = "../app/public/data";
const outputFilePath = `${DESTINATION_DIR}/${DATA_FILENAME}`;

async function main(): Promise<void> {
	// Fetch the rankings data as js code from wca-seniors.org
	const code = await fetchRankingsData();

	// Extract the data as JSON
	const rankingSnapshot = await convertToJson(code);

	// Build enhanced data structures directly
	const enhancedData = buildEnhancedData(rankingSnapshot);

	// Generate and include top ranks
	const topRanks = buildTopRanks(enhancedData);
	const combinedData: EnhancedRankingsData = {
		...enhancedData,
		topRanks
	};

	// Write the combined data
	await writeFile(outputFilePath, JSON.stringify(combinedData, null, 0), "utf8");
	process.stdout.write("✅ Rankings data created successfully.\n");
}

// Fetch the rankings data from wca-seniors.org
async function fetchRankingsData(): Promise<string> {
	const response = await fetch(RANKINGS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch rankings data: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

// Extract straight JSON data from the js code
async function convertToJson(sourceCode: string): Promise<RankingsSnapshot> {
	interface GlobalData {
		rankings?: RankingsSnapshot | undefined;
	}
	const sandbox: GlobalData = {};
	const context = createContext(sandbox);

	runInContext(sourceCode, context);

	if (!sandbox.rankings) {
		throw new Error('"rankings" is not defined.');
	}

	return sandbox.rankings;
}

function buildEnhancedData(rankings: RankingsSnapshot): Omit<EnhancedRankingsData, "topRanks"> {
	const results: FlatResult[] = [];
	const persons: {[personId: string]: PersonProfile;} = {};
	const competitions: {[id: number]: {id: number; webId: string; name: string; country: string; startDate: string;};} = {};
	const continents: {[id: string]: {id: string; name: string;};} = {};
	const countries: {[id: string]: {id: string; name: string; continent: string;};} = {};
	const events: {[id: string]: {id: WCAEventId; name: string; format: "time" | "number" | "multi";};} = {};
	const missing: {[eventId: string]: {[type: string]: {[age: number]: Missing;};};} = {};

	// Preserve canonical event order from source data
	const eventOrder: WCAEventId[] = rankings.events.map(event => event.id);

	// Build O(1) lookup tables first
	const personIdToIndex: {[key: string]: number} = {};
	const competitionIdToIndex: {[key: number]: number} = {};
	const continentIdToIndex: {[key: string]: number} = {};
	const countryIdToIndex: {[key: string]: number} = {};

	for (const [index, person] of rankings.persons.entries()) {
		personIdToIndex[person.id] = index;
	}

	for (const [index, competition] of rankings.competitions.entries()) {
		competitionIdToIndex[competition.id] = index;
		competitions[competition.id] = {
			id: competition.id,
			webId: competition.webId,
			name: competition.name,
			country: competition.country,
			startDate: competition.startDate
		};
	}

	for (const [index, continent] of rankings.continents.entries()) {
		continentIdToIndex[continent.id] = index;
		continents[continent.id] = {
			id: continent.id,
			name: continent.name
		};
	}

	for (const [index, country] of rankings.countries.entries()) {
		countryIdToIndex[country.id] = index;
		countries[country.id] = {
			id: country.id,
			name: country.name,
			continent: country.continent
		};
	}

	// Build events lookup table
	for (const event of rankings.events) {
		events[event.id] = {
			id: event.id,
			name: event.name,
			format: event.format
		};
	}

	// First pass: Create all flat results with full context
	for (const event of rankings.events) {
		if (!missing[event.id]) {
			missing[event.id] = {};
		}

		for (const eventRanking of event.rankings) {
			const {age, type, ranks} = eventRanking;

			// Copy missing data for this event/type/age combination
			if (!missing[event.id][type]) {
				missing[event.id][type] = {};
			}
			missing[event.id][type][age] = eventRanking.missing;

			// Skip if no ranks
			if (ranks.length === 0) {
				continue;
			}

			// Build regional rankings for this specific combination
			const regionalRankings = buildRegionalRankings(
				ranks,
				eventRanking.missing,
				rankings,
				personIdToIndex,
				countryIdToIndex,
				continentIdToIndex
			);

			for (let i = 0; i < ranks.length; i++) {
				const rank = ranks[i];
				const person = rankings.persons[personIdToIndex[rank.id]];
				const country = rankings.countries[countryIdToIndex[person.country]];
				const continent = rankings.continents[continentIdToIndex[country.continent]];
				const competition = rankings.competitions[competitionIdToIndex[rank.competition]];

				// Calculate ranks
				const worldRank = rank.rank;
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
		const person = rankings.persons[personIdToIndex[result.personId]];
		const country = rankings.countries[countryIdToIndex[person.country]];
		const continent = rankings.continents[continentIdToIndex[country.continent]];

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
		lastUpdated: rankings.refreshed,
		eventOrder,
		results,
		persons,
		competitions,
		continents,
		countries,
		events,
		missing
	};
}

function buildRegionalRankings(
	ranks: Rank[],
	missingData: Missing,
	rankings: RankingsSnapshot,
	personIdToIndex: {[key: string]: number},
	countryIdToIndex: {[key: string]: number},
	continentIdToIndex: {[key: string]: number}
) {
	const continents: {[continentId: string]: {[personId: string]: number;};} = {};
	const countries: {[countryId: string]: {[personId: string]: number;};} = {};

	const continentCounts: {[id: string]: number;} = {};
	const countryCounts: {[id: string]: number;} = {};

	// Track previous result and rank PER REGION
	const prevContinentResults: {[id: string]: string} = {};
	const prevCountryResults: {[id: string]: string} = {};
	const prevContinentRanks: {[id: string]: number} = {};
	const prevCountryRanks: {[id: string]: number} = {};

	const worldMissing = missingData.world;

	for (let arrayIndex = 0; arrayIndex < ranks.length; arrayIndex++) {
		const rank = ranks[arrayIndex];
		const person = rankings.persons[personIdToIndex[rank.id]];
		const country = rankings.countries[countryIdToIndex[person.country]];
		const continent = rankings.continents[continentIdToIndex[country.continent]];

		if (!continents[continent.id]) {
			continents[continent.id] = {};
		}
		if (!countries[country.id]) {
			countries[country.id] = {};
		}

		continentCounts[continent.id] = (continentCounts[continent.id] ?? 0) + 1;
		countryCounts[country.id] = (countryCounts[country.id] ?? 0) + 1;

		let continentRank: number;
		let countryRank: number;

		// Continent rank
		if (rank.best === prevContinentResults[continent.id]) {
			continentRank = prevContinentRanks[continent.id];
		} else {
			const gap = rank.rank - arrayIndex - 1;
			const continentMissing = missingData.continents?.[continent.id];
			const continentFakeRatio = (worldMissing > 0 && continentMissing !== undefined)
				? continentMissing / worldMissing
				: 0;

			if (gap > 0) {
				continentRank = Math.round(continentCounts[continent.id] + continentFakeRatio * gap);
			} else {
				continentRank = continentCounts[continent.id];
			}

			prevContinentResults[continent.id] = rank.best;
			prevContinentRanks[continent.id] = continentRank;
		}

		// Country rank
		if (rank.best === prevCountryResults[country.id]) {
			countryRank = prevCountryRanks[country.id];
		} else {
			const gap = rank.rank - arrayIndex - 1;
			const countryMissing = missingData.countries?.[country.id];
			const countryFakeRatio = (worldMissing > 0 && countryMissing !== undefined)
				? countryMissing / worldMissing
				: 0;

			if (gap > 0) {
				countryRank = Math.round(countryCounts[country.id] + countryFakeRatio * gap);
			} else {
				countryRank = countryCounts[country.id];
			}

			prevCountryResults[country.id] = rank.best;
			prevCountryRanks[country.id] = countryRank;
		}

		continents[continent.id]![person.id] = continentRank;
		countries[country.id]![person.id] = countryRank;
	}

	return {continents, countries};
}

void main().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});

// Ensure the destination directory exists
await mkdir(DESTINATION_DIR, {recursive: true});