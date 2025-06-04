import {writeFile, mkdir} from "node:fs/promises";
import {createContext, runInContext} from "node:vm";
import type {RankingsSnapshot, ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";

const RANKINGS_URL = "https://wca-seniors.org/data/Senior_Rankings.js";
const DESTINATION_DIR = "../dist/data";
const outputFilePath = `${DESTINATION_DIR}/senior-rankings.json`;

async function main(): Promise<void> {
	// Fetch the rankings data as js code from wca-seniors.org
	const code = await fetchRankingsData();

	// Extract the data as JSON
	const rankingSnapshot = await convertToJson(code);

	// Do some offline pre-processing to facilitate lookups
	const extendedRankingsData = processRankingData(rankingSnapshot);

	// Write the data file
	await writeJsonToFile(extendedRankingsData);

	process.stdout.write("✅ Data conversion completed successfully.\n");
}

void main().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});

// Fetch the rankings data from wca-seniors.org
//
async function fetchRankingsData(): Promise<string> {
	const response = await fetch(RANKINGS_URL);
	if (!response.ok) {
		throw new Error(`Failed to fetch rankings data: ${response.status} ${response.statusText}`);
	}
	return response.text();
}

// Extract straight JSON data from the js code
//
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

function processRankingData(data: RankingsSnapshot): ExtendedRankingsData {
	const competitionIdToIndex = buildCompetitionLookup(data);
	const personIdToIndex = buildPersonLookup(data);
	const continentIdToIndex = buildContinentLookup(data);
	const countryIdToIndex = buildCountryLookup(data);
	const activeRegions = buildActiveRegions(
		data,
		personIdToIndex,
		continentIdToIndex,
		countryIdToIndex
	);

	return {
		lastUpdated: data.refreshed,
		data: data,
		competitionIdToIndex: competitionIdToIndex,
		personIdToIndex: personIdToIndex,
		continentIdToIndex: continentIdToIndex,
		countryIdToIndex: countryIdToIndex,
		activeRegions: activeRegions,
	};
}

//
function buildCompetitionLookup(rankings: RankingsSnapshot) {
	const lookup: ExtendedRankingsData["competitionIdToIndex"] = {};

	for (const [index, competition] of rankings.competitions.entries()) {
		lookup[competition.id] = index;
	}

	return lookup;
}

function buildPersonLookup(rankings: RankingsSnapshot) {
	const lookup: ExtendedRankingsData["personIdToIndex"] = {};

	for (const [index, person] of rankings.persons.entries()) {
		lookup[person.id] = index;
	}

	return lookup;
}

function buildContinentLookup(rankings: RankingsSnapshot) {
	const lookup: ExtendedRankingsData["continentIdToIndex"] = {};

	for (const [index, continent] of rankings.continents.entries()) {
		lookup[continent.id] = index;
	}

	return lookup;
}

function buildCountryLookup(rankings: RankingsSnapshot) {
	const lookup: ExtendedRankingsData["countryIdToIndex"] = {};

	for (const [index, country] of rankings.countries.entries()) {
		lookup[country.id] = index;
	}

	return lookup;
}

function buildActiveRegions(
	rankingsData: RankingsSnapshot,
	personIdToIndex: {[key: string]: number;},
	continentIdToIndex: {[key: string]: number;},
	countryIdToIndex: {[key: string]: number;}
): ExtendedRankingsData["activeRegions"] {

	const continents = new Set<string>();
	const countries = new Set<string>();

	for (const event of rankingsData.events) {
		for (const eventRanking of event.rankings) {
			for (const rank of eventRanking.ranks) {
				const person = rankingsData.persons[personIdToIndex[rank.id]];
				if (!person) {
					throw new Error(`Missing competitor ID ${rank.id}`);
				}
				const country = rankingsData.countries[countryIdToIndex[person.country]];
				if (!country) {
					throw new Error(`Missing country ID ${person.country}`);
				}
				const continent = rankingsData.continents[continentIdToIndex[country.continent]];
				if (!continent) {
					throw new Error(`Missing continent ID ${country.continent}`);
				}

				continents.add(continent.id);
				countries.add(country.id);
			}
		}
	}

	return {
		continents: [...continents],
		countries: [...countries],
	};
}

//
async function writeJsonToFile(data: object): Promise<void> {
	await mkdir(DESTINATION_DIR, {recursive: true});
	await writeFile(outputFilePath, JSON.stringify(data, null, 0), "utf8");
}
