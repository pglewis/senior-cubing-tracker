import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {EnhancedRankingsData, FlatResult} from "@repo/common/types/enhanced-rankings";
import {scoreAverageOnly, type TopRank} from "@repo/common/types/kinch-types";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";

// Generate top ranks data for each event/age/region combination
export function buildTopRanks(enhancedRankings: Pick<EnhancedRankingsData, "results">): TopRank[] {
	const topRanks: TopRank[] = [];

	// Group results by event/type/age to find the best result for each combination
	const eventGroups = new Map<string, FlatResult[]>();

	// Group all results by event/type/age combination
	for (const result of enhancedRankings.results) {
		const key = `${result.eventId}-${result.type}-${result.age}`;

		if (!eventGroups.has(key)) {
			eventGroups.set(key, []);
		}
		eventGroups.get(key)!.push(result);
	}

	// Process each event/type/age group
	for (const [key, results] of eventGroups) {
		const [eventId, type, ageStr] = key.split("-");
		const age = parseInt(ageStr);

		// Skip if this combination should be filtered out
		if (scoreAverageOnly[eventId as WCAEventId] && type !== "average") {
			continue;
		}

		if (results.length === 0) {
			continue;
		}

		// Sort by world rank (results are already ranked, but let's be explicit)
		results.sort((a, b) => a.worldRank - b.worldRank);

		// World ranking (best result overall)
		topRanks.push({
			eventId: eventId,
			type: type as "single" | "average",
			age: age,
			region: "world",
			result: results[0].result,
			personId: results[0].personId,
			date: results[0].date
		});

		// Track regions we've already added to avoid duplicates
		const addedRegions = new Set<string>();

		// Find best result for each continent and country
		for (const result of results) {
			// Best result for this continent
			const continentRegion = toRegionParam(result.continentId, true);
			if (!addedRegions.has(continentRegion)) {
				addedRegions.add(continentRegion);
				topRanks.push({
					eventId: eventId,
					type: type as "single" | "average",
					age: age,
					region: continentRegion,
					result: result.result,
					personId: result.personId,
					date: result.date
				});
			}

			// Best result for this country
			const countryRegion = toRegionParam(result.countryId, false);
			if (!addedRegions.has(countryRegion)) {
				addedRegions.add(countryRegion);
				topRanks.push({
					eventId: eventId,
					type: type as "single" | "average",
					age: age,
					region: countryRegion,
					result: result.result,
					personId: result.personId,
					date: result.date
				});
			}
		}
	}

	return topRanks;
}
