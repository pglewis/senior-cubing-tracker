import {useMemo} from "react";
import {useDataOptional} from "@repo/app/hooks/use-data";
import {getRecordHolder} from "@repo/common/util/event-records";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {EventRecord, EventRecords} from "@repo/common/types/event-records";

interface TopKinchResultsFilters {
	age: string;
	region: string;
}

export function useTopKinchResults(filters: TopKinchResultsFilters): EventRecords[] {
	const {rankings, topRanks} = useDataOptional();

	return useMemo(() => {
		if (!rankings || !topRanks) {
			return [];
		}

		const targetAge = parseInt(filters.age);

		const filteredTopRanks = topRanks.filter(tr =>
			tr.age === targetAge && tr.region === filters.region
		);

		const eventMap = new Map<string, {single?: TopRank; average?: TopRank}>();

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

		const results: EventRecords[] = [];

		for (const eventId of rankings.eventOrder) {
			const entry = eventMap.get(eventId);

			if (!entry) {
				continue;
			}

			results.push({
				eventId,
				eventName: rankings.events[eventId].name,
				single: entry.single && toEventRecord(rankings, entry.single),
				average: entry.average && toEventRecord(rankings, entry.average),
			});
		}

		return results;
	}, [rankings, topRanks, filters.age, filters.region]);
}

function toEventRecord(rankings: EnhancedRankingsData, topRank: TopRank): EventRecord {
	return {
		result: topRank.result,
		holders: topRank.holders.map(holder => getRecordHolder(rankings, {
			personId: holder.personId,
			eventId: topRank.eventId,
			type: topRank.type,
			result: topRank.result,
			date: holder.date,
			age: topRank.age,
		})),
	};
}
