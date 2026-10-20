import type {FlatResult} from "@repo/common/types/enhanced-rankings";

export interface BestResult {
	result: string;
	/** Every result equal to the best, in world-rank order */
	holders: FlatResult[];
}

/**
 * The best of a group of results for one event, type, age and region: the first
 * in world-rank order. Everyone with an equal result shares it.
 * @param results Results for a single event, type, age and region
 */
export function getBestResult(results: FlatResult[]): BestResult | undefined {
	if (results.length === 0) {
		return undefined;
	}

	const sorted = [...results].sort((a, b) => a.worldRank - b.worldRank);
	const best = sorted[0].result;

	return {
		result: best,
		holders: sorted.filter(result => result.result === best),
	};
}
