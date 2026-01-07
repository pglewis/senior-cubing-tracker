import {useMemo} from "react";
import {useDataOptional} from "@repo/app/hooks/use-data";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";

interface TopResultForEvent {
	eventId: WCAEventId;
	eventName: string;
	single?: {
		result: string;
		personId: string;
		personName: string;
		date: string;
	};
	average?: {
		result: string;
		personId: string;
		personName: string;
		date: string;
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

		// Filter topRanks by age and region
		const filteredTopRanks = topRanks.filter(tr =>
			tr.age === targetAge && tr.region === filters.region
		);

		// Group by event
		const eventMap = new Map<WCAEventId, {single?: TopRank; average?: TopRank}>();

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

		// Build results array in event order
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
				const person = rankings.persons[entry.single.personId];
				result.single = {
					result: entry.single.result,
					personId: entry.single.personId,
					personName: person?.name || "Unknown",
					date: entry.single.date
				};
			}

			if (entry.average) {
				const person = rankings.persons[entry.average.personId];
				result.average = {
					result: entry.average.result,
					personId: entry.average.personId,
					personName: person?.name || "Unknown",
					date: entry.average.date
				};
			}

			results.push(result);
		}

		return results;
	}, [rankings, topRanks, filters.age, filters.region]);
}
