import {useMemo} from "react";
import {useDataOptional} from "@repo/app/hooks/use-data";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";

interface TopResultForEvent {
	eventId: WCAEventId;
	eventName: string;
	single?: {
		result: string;
		holders: {
			personId: string;
			personName: string;
			date: string;
			achievementAge: number;
		}[];
	};
	average?: {
		result: string;
		holders: {
			personId: string;
			personName: string;
			date: string;
			achievementAge: number;
		}[];
	};
}

interface TopKinchResultsFilters {
	age: string;
	region: string;
}

export function useTopKinchResults(filters: TopKinchResultsFilters): TopResultForEvent[] {
	const {rankings, topRanks} = useDataOptional();

	return useMemo(() => {
		if (!rankings || !topRanks) {
			return [];
		}

		const targetAge = parseInt(filters.age);

		const filteredTopRanks = topRanks.filter(tr =>
			tr.age === targetAge && tr.region === filters.region
		);

		const eventMap = new Map<string, { single?: TopRank; average?: TopRank }>();

		for (const topRank of filteredTopRanks) {
			const eventId = topRank.eventId as WCAEventId;

			if (!eventMap.has(eventId)) {
				eventMap.set(eventId, {});
			}

			const entry = eventMap.get(eventId)!;

			if (topRank.type === "single") {
				entry.single = topRank;
			} else {
				entry.average = topRank;
			}
		}

		const results: TopResultForEvent[] = [];

		for (const eventId of rankings.eventOrder) {
			const entry = eventMap.get(eventId);

			if (!entry) {
				continue;
			}

			const result: TopResultForEvent = {
				eventId,
				eventName: rankings.events[eventId].name
			};

			if (entry.single) {
				result.single = {
					result: entry.single.result,
					holders: entry.single.holders.map(h => {
						const person = rankings.persons[h.personId];
						return {
							personId: h.personId,
							personName: person?.name || "Unknown",
							date: h.date,
							achievementAge: getAchievementAge(rankings, entry.single!, h)
						};
					})
				};
			}

			if (entry.average) {
				result.average = {
					result: entry.average.result,
					holders: entry.average.holders.map(h => {
						const person = rankings.persons[h.personId];
						return {
							personId: h.personId,
							personName: person?.name || "Unknown",
							date: h.date,
							achievementAge: getAchievementAge(rankings, entry.average!, h)
						};
					})
				};
			}

			results.push(result);
		}

		return results;
	}, [rankings, topRanks, filters.age, filters.region]);
}

function getAchievementAge(
	rankings: EnhancedRankingsData,
	topRank: TopRank,
	holder: { personId: string; date: string }
): number {
	const person = rankings.persons[holder.personId];
	if (!person) return topRank.age;
	let max = topRank.age;
	for (const idx of person.resultIndices) {
		const r = rankings.results[idx];
		if (r.eventId === topRank.eventId && r.type === topRank.type && r.result === topRank.result && r.age > max) {
			max = r.age;
		}
	}
	return max;
}