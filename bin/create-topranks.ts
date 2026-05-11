import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {EnhancedRankingsData, FlatResult} from "@repo/common/types/enhanced-rankings";
import {scoreAverageOnly, type TopRank} from "@repo/common/types/kinch-types";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";

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
		const age = parseInt(ageStr);

		if (scoreAverageOnly[eventId as WCAEventId] && type !== "average") {
			continue;
		}
		if (results.length === 0) {
			continue;
		}

		results.sort((a, b) => a.worldRank - b.worldRank);

		// World — first result in world-rank order sets the benchmark
		const worldBestResult = results[0].result;
		const worldHolders: { personId: string; date: string }[] = [];
		for (const result of results) {
			if (result.result === worldBestResult) {
				worldHolders.push({personId: result.personId, date: result.date});
			}
		}
		topRanks.push({
			eventId,
			type: type as "single" | "average",
			age,
			region: "world",
			result: worldBestResult,
			holders: worldHolders
		});

		// Regions — first result per region in world-rank order sets the benchmark
		const regionBestResult = new Map<string, string>();
		const regionHolders = new Map<string, { personId: string; date: string }[]>();

		for (const result of results) {
			for (const regionKey of [toRegionParam(result.continentId, true), toRegionParam(result.countryId, false)]) {
				if (!regionBestResult.has(regionKey)) {
					regionBestResult.set(regionKey, result.result);
					regionHolders.set(regionKey, [{personId: result.personId, date: result.date}]);
				} else if (result.result === regionBestResult.get(regionKey)) {
					regionHolders.get(regionKey)!.push({personId: result.personId, date: result.date});
				}
			}
		}

		for (const [region, holders] of regionHolders) {
			topRanks.push({
				eventId,
				type: type as "single" | "average",
				age,
				region,
				result: regionBestResult.get(region)!,
				holders
			});
		}
	}

	return topRanks;
}