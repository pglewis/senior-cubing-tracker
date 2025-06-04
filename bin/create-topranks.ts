import {readFile, writeFile} from "fs/promises";
import type {ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";
import {scoreAverageOnly, type TopRank} from "@repo/common/types/kinch-types";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";

const RANKINGS_FILE = "../dist/data/senior-rankings.json";
const TOPRANKS_FILE = "../dist/data/topranks.json";

async function main(): Promise<void> {
	// Load and parse the rankings data
	const rawData = await readFile(RANKINGS_FILE, "utf-8");
	const rankings: ExtendedRankingsData = JSON.parse(rawData);

	// Generate top ranks data for each event/age/region combination
	const topRanks = buildTopRanks(rankings);

	await writeFile(TOPRANKS_FILE, JSON.stringify(topRanks, null, 0), "utf8");
	process.stdout.write("✅ Top ranks files created successfully.\n");
}

void main().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});

// Generate top ranks data for each event/age/region combination
export function buildTopRanks(rankings: ExtendedRankingsData): TopRank[] {
	const rankingsData = rankings.data;
	const topRanks: TopRank[] = [];

	// id, name, format ("time" | "number" | "multi"), rankings: EventRanking[]
	for (const event of rankingsData.events) {

		// type: "single" | "average", age (40, 50, ...), ranks: Rank[]
		for (const eventRanking of event.rankings) {
			const {age, ranks} = eventRanking;

			if (ranks.length === 0 || (scoreAverageOnly[event.id] && eventRanking.type !== "average")) {
				continue;
			}

			// World ranking (no prefix needed)
			topRanks.push({
				eventId: event.id,
				type: eventRanking.type,
				age: age,
				region: "world",
				result: ranks[0].best
			});

			const regions = new Set<string>();

			// rank, id (WCA id), best (event result), competition (Competition["id"]),
			for (const rank of ranks) {
				const person = rankingsData.persons[rankings.personIdToIndex[rank.id]];
				const country = rankingsData.countries[rankings.countryIdToIndex[person.country]];
				const continent = rankingsData.continents[rankings.continentIdToIndex[country.continent]];

				// First ranking for each continent is the top ranking for the region
				const continentRegion = toRegionParam(continent.id, true);
				if (!regions.has(continentRegion)) {
					regions.add(continentRegion);
					topRanks.push({
						eventId: event.id,
						type: eventRanking.type,
						age: age,
						region: continentRegion,
						result: rank.best,
					});
				}

				// First ranking for each country is the top ranking for the region
				const countryRegion = toRegionParam(country.id, false);
				if (!regions.has(countryRegion)) {
					regions.add(countryRegion);
					topRanks.push({
						eventId: event.id,
						type: eventRanking.type,
						age: age,
						region: countryRegion,
						result: rank.best,
					});
				}
			}
		}
	}

	return topRanks;
}
