import {readFile, writeFile} from "fs/promises";
import type {ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";
import {scoreAverageOnly, type TopRank} from "@repo/common/types/kinch-types";

const RANKINGS_FILE = "../dist/data/senior-rankings.json";
const TOPRANKS_FILE = "../dist/data/topranks.json";

async function main(): Promise<void> {
	// Load and parse the rankings data
	const rawData = await readFile(RANKINGS_FILE, "utf-8");
	const rankings: ExtendedRankingsData = JSON.parse(rawData);

	// Now you can use the rankings data with buildTopRanks()
	const topRanks = buildTopRanks(rankings);

	await writeFile(TOPRANKS_FILE, JSON.stringify(topRanks, null, 0), "utf8");
	process.stdout.write("✅ Top ranks files created successfully.\n");
}

void main().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});

export function buildTopRanks(rankings: ExtendedRankingsData): TopRank[] {
	const rankingsData = rankings.data;
	const topRanks: TopRank[] = [];

	// format (time, number, multi), id (eg "333"), name ("3x3x3 Cube"), rankings[]
	for (const event of rankingsData.events) {

		// type (single/average) and age(40, 50, etc), ranks[]
		for (const eventRanking of event.rankings) {
			const {age, ranks} = eventRanking;

			if (ranks.length === 0 || (scoreAverageOnly[event.id] && eventRanking.type !== "average")) {
				continue;
			}

			// Stash the top (world) ranking
			topRanks.push({
				eventID: event.id,
				type: eventRanking.type,
				age: age,
				region: "world",
				result: ranks[0].best
			});

			// rank (#), id (wca id), best (results), competition (comp ID)
			const regions = new Set();
			for (const rank of ranks) {
				const person = rankingsData.persons[rankings.personIDToIndex[rank.id]];
				const country = rankingsData.countries[rankings.countryIDToIndex[person.country]];
				const continent = rankingsData.continents[rankings.continentIDToIndex[country.continent]];

				// First ranking for each continent is top for the region
				if (!regions.has(continent.id)) {
					regions.add(continent.id);

					topRanks.push({
						eventID: event.id,
						type: eventRanking.type,
						age: age,
						region: continent.id,
						result: rank.best,
					});
				}

				// First ranking for each country is top for the region
				if (!regions.has(country.id)) {
					regions.add(country.id);

					topRanks.push({
						eventID: event.id,
						type: eventRanking.type,
						age: age,
						region: country.id,
						result: rank.best,
					});
				}
			}
		}
	}

	return topRanks;
}
