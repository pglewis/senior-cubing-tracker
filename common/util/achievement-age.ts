import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";

/** The fields that identify one achieved result */
interface ResultIdentity {
	eventId: string;
	type: string;
	result: string;
	date: string;
}

/**
 * Key for one achieved result. The same result appears once per age category it
 * is eligible for, and all of those copies share this key.
 */
export function getResultKey({eventId, type, result, date}: ResultIdentity): string {
	return `${eventId}-${type}-${result}-${date}`;
}

/**
 * Map each of a person's results (by getResultKey) to the age category it was
 * achieved in. A result counts toward every age category up to the competitor's
 * age at the time, so the oldest category holding it is the one it was set in.
 */
export function getAchievementAges(
	rankings: Pick<EnhancedRankingsData, "results" | "persons">,
	personId: string
): Map<string, number> {
	const achievementAges = new Map<string, number>();
	const person = rankings.persons[personId];

	if (!person) {
		return achievementAges;
	}

	for (const idx of person.resultIndices) {
		const result = rankings.results[idx];
		const key = getResultKey(result);

		if (result.age > (achievementAges.get(key) ?? 0)) {
			achievementAges.set(key, result.age);
		}
	}

	return achievementAges;
}
