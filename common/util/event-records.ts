import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {RecordHolder} from "@repo/common/types/event-records";
import {getAchievementAges, getResultKey} from "@repo/common/util/achievement-age";

interface HolderResult {
	personId: string;
	eventId: string;
	type: string;
	result: string;
	date: string;
	/** Age category of the ranking the result is listed in */
	age: number;
}

/** Display details for one holder of a record */
export function getRecordHolder(
	rankings: Pick<EnhancedRankingsData, "results" | "persons">,
	holderResult: HolderResult
): RecordHolder {
	const person = rankings.persons[holderResult.personId];
	const achievementAges = getAchievementAges(rankings, holderResult.personId);

	return {
		personId: holderResult.personId,
		personName: person?.name || "Unknown",
		countryId: person?.countryId ?? "",
		date: holderResult.date,
		achievementAge: achievementAges.get(getResultKey(holderResult)) ?? holderResult.age,
	};
}
