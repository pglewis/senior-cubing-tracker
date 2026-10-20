import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {EnhancedRankingsData, FlatResult} from "@repo/common/types/enhanced-rankings";
import {scoreAverageOnly, type TopRank} from "@repo/common/types/kinch-types";
import {isResultInRegion, toRegionParam} from "@repo/common/util/region-utils";
import {getBestResult} from "@repo/common/util/best-result";

// Generate top ranks data for each event/age/region combination
export function buildTopRanks(enhancedRankings: Pick<EnhancedRankingsData, "results">): TopRank[] {
	const topRanks: TopRank[] = [];
	const eventGroups = new Map<string, FlatResult[]>();

	for (const result of enhancedRankings.results) {
		const key = `${result.eventId}-${result.type}-${result.age}`;
		if (!eventGroups.has(key)) {
			eventGroups.set(key, []);
		}
		eventGroups.get(key)!.push(result);
	}

	for (const [key, results] of eventGroups) {
		const [eventId, type, ageStr] = key.split("-");

		if (scoreAverageOnly[eventId as WCAEventId] && type !== "average") {
			continue;
		}

		for (const region of getRegions(results)) {
			const best = getBestResult(results.filter(result => isResultInRegion(result, region)));
			if (!best) {
				continue;
			}

			topRanks.push({
				eventId,
				type: type as "single" | "average",
				age: parseInt(ageStr),
				region,
				result: best.result,
				holders: best.holders.map(holder => ({personId: holder.personId, date: holder.date}))
			});
		}
	}

	return topRanks;
}

// World first, then each continent and country in the order they appear in world-rank order
function getRegions(results: FlatResult[]): string[] {
	const regions = new Set<string>(["world"]);
	const sorted = [...results].sort((a, b) => a.worldRank - b.worldRank);

	for (const result of sorted) {
		regions.add(toRegionParam(result.continentId, true));
		regions.add(toRegionParam(result.countryId, false));
	}

	return Array.from(regions);
}
