import {useMemo} from "react";
import {scoreAverageOnly, type KinchRank, type KinchEvent, type TopRank} from "@repo/common/types/kinch-types";
import type {EnhancedRankingsData, FlatResult} from "@repo/common/types/enhanced-rankings";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import {timeResultToSeconds, parseMultiResult} from "@repo/common/util/parse";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {useData} from "@repo/app/hooks/use-data";

interface KinchFilters {
	age: string;
	// Prefixed region id (e.g. "CNA" or "NNA")
	region: string;
}

// Outside component - persists across component unmounts
const kinchCache = new Map();

export function useKinchRanks(filters: KinchFilters): KinchRank[] {
	const {rankings, topRanks} = useData();

	return useMemo(() => {
		if (!rankings || !topRanks) {
			return [];
		}

		const cacheKey = `${rankings?.lastUpdated || "v1"}-${filters.age || "all"}-${filters.region || "all"}`;

		if (kinchCache.has(cacheKey)) {
			return kinchCache.get(cacheKey);
		}

		// Get events in canonical order from the enhanced rankings data
		const allEvents = rankings.eventOrder;

		// Filter results by age and region upfront
		const relevantResults = getRelevantResults(rankings, filters);

		// Group results by person for easy access
		const resultsByPerson = groupResultsByPerson(relevantResults);

		// Calculate kinch ranks for each person
		const ranks: KinchRank[] = [];
		for (const [personId, personResults] of resultsByPerson) {
			const kinchRank = getRanksForPerson(rankings, topRanks, filters, personId, personResults, allEvents);
			if (kinchRank.overall > 0) {
				ranks.push(kinchRank);
			}
		}

		ranks.sort((a, b) => b.overall - a.overall);

		kinchCache.set(cacheKey, ranks);

		// Cleanup old entries periodically
		if (kinchCache.size > 50) {
			const keysToDelete = Array.from(kinchCache.keys()).slice(0, 10);
			keysToDelete.forEach(key => kinchCache.delete(key));
		}

		return ranks;
	}, [rankings, topRanks, filters]);
}

function getRelevantResults(rankings: EnhancedRankingsData, filters: KinchFilters): FlatResult[] {
	const targetAge = parseInt(filters.age);

	return rankings.results.filter(result => {
		// Filter by age
		if (result.age !== targetAge) {
			return false;
		}

		// Filter by region
		if (filters.region === "world") {
			return true;
		}

		const countryRegion = toRegionParam(result.countryId, false);
		const continentRegion = toRegionParam(result.continentId, true);

		return filters.region === countryRegion || filters.region === continentRegion;
	});
}

function groupResultsByPerson(results: FlatResult[]): Map<string, FlatResult[]> {
	const grouped = new Map<string, FlatResult[]>();

	for (const result of results) {
		if (!grouped.has(result.personId)) {
			grouped.set(result.personId, []);
		}
		grouped.get(result.personId)!.push(result);
	}

	return grouped;
}

function getRanksForPerson(
	rankings: EnhancedRankingsData,
	topRanks: TopRank[],
	filters: KinchFilters,
	personId: string,
	personResults: FlatResult[],
	allEvents: WCAEventId[]
): KinchRank {
	const person = rankings.persons[personId];
	if (!person) {
		throw new Error(`Person with ID "${personId}" not found.`);
	}

	const kinchRank: KinchRank = {
		personId: personId,
		personName: person.name,
		overall: 0,
		events: []
	};

	// Group person's results by event and type for quick lookup
	const resultsByEventType = new Map<string, FlatResult>();
	for (const result of personResults) {
		const key = `${result.eventId}-${result.type}`;
		resultsByEventType.set(key, result);
	}

	// Calculate score for each event using the dynamic events list
	for (const eventId of allEvents) {
		if (eventId === "333mbf") {
			// Multi blind is a special case
			kinchRank.events.push(getPersonMultiScore(topRanks, eventId, resultsByEventType, filters, rankings));
		} else if (scoreAverageOnly[eventId]) {
			// Use the average only
			kinchRank.events.push(getPersonAverageScore(topRanks, eventId, resultsByEventType, filters, rankings));
		} else {
			// Best of single or average
			kinchRank.events.push(getPersonSingleOrAverageScore(topRanks, eventId, resultsByEventType, filters, rankings));
		}
	}

	kinchRank.overall = kinchRank.events.reduce((acc, current) => acc + current.score, 0) / kinchRank.events.length;
	return kinchRank;
}

function getTopRank(
	topRanks: TopRank[],
	eventId: WCAEventId,
	type: "single" | "average",
	filters: KinchFilters
): TopRank | undefined {
	return topRanks.find(r =>
		r.eventId === eventId &&
		r.type === type &&
		r.age === Number(filters.age) &&
		r.region === filters.region
	);
}

function getPersonAverageScore(
	topRanks: TopRank[],
	eventId: WCAEventId,
	resultsByEventType: Map<string, FlatResult>,
	filters: KinchFilters,
	rankings: EnhancedRankingsData
): KinchEvent {
	const topRank = getTopRank(topRanks, eventId, "average", filters);
	const result = resultsByEventType.get(`${eventId}-average`);

	if (!result || !topRank) {
		return {
			eventId: eventId,
			eventName: rankings.events[eventId].name,
			score: 0,
			result: "",
			type: null,
		};
	}

	return {
		eventId: eventId,
		eventName: rankings.events[eventId].name,
		score: getPersonScore("time", topRank, result.result), // Most average events are time-based
		result: result.result,
		type: "average",
	};
}

function getPersonSingleOrAverageScore(
	topRanks: TopRank[],
	eventId: WCAEventId,
	resultsByEventType: Map<string, FlatResult>,
	filters: KinchFilters,
	rankings: EnhancedRankingsData
): KinchEvent {
	const singleTopRank = getTopRank(topRanks, eventId, "single", filters);
	const averageTopRank = getTopRank(topRanks, eventId, "average", filters);
	const singleResult = resultsByEventType.get(`${eventId}-single`);
	const averageResult = resultsByEventType.get(`${eventId}-average`);

	if (!singleResult || !singleTopRank) {
		return {
			eventId: eventId,
			eventName: rankings.events[eventId].name,
			score: 0,
			result: "",
			type: null,
		};
	}

	let result: string;
	let score = 0;
	let type: KinchEvent["type"];

	// Get event format from enhanced data
	const format = rankings.events[eventId].format;

	const singleScore = getPersonScore(format, singleTopRank, singleResult.result);

	if (averageResult && averageTopRank) {
		const averageScore = getPersonScore(format, averageTopRank, averageResult.result);

		// Pick the best score of the two
		if (singleScore > averageScore) {
			score = singleScore;
			result = singleResult.result;
			type = "single";
		} else {
			score = averageScore;
			result = averageResult.result;
			type = "average";
		}
	} else {
		score = singleScore;
		result = singleResult.result;
		type = "single";
	}

	return {
		eventId: eventId,
		eventName: rankings.events[eventId].name,
		score: score,
		result: result,
		type: type,
	};
}

function getPersonScore(
	format: "time" | "number" | "multi",
	topRank: TopRank,
	result: string
) {
	if (format === "time") {
		return (timeResultToSeconds(topRank.result) / timeResultToSeconds(result)) * 100;
	} else {
		return (Number(topRank.result) / Number(result)) * 100;
	}
}

function getPersonMultiScore(
	topRanks: TopRank[],
	eventId: WCAEventId,
	resultsByEventType: Map<string, FlatResult>,
	filters: KinchFilters,
	rankings: EnhancedRankingsData
): KinchEvent {
	const topRank = getTopRank(topRanks, eventId, "single", filters);
	const result = resultsByEventType.get(`${eventId}-single`);

	if (!result || !topRank) {
		return {
			eventId: eventId,
			eventName: rankings.events[eventId].name,
			score: 0,
			result: "",
			type: null,
		};
	}

	// Bigger result is better for mbld, so the division is reversed
	return {
		eventId: eventId,
		eventName: rankings.events[eventId].name,
		score: (getKinchMultiScore(result.result) / getKinchMultiScore(topRank.result)) * 100,
		result: result.result,
		type: "single",
	};
}

function getKinchMultiScore(result: string) {
	const multiResult = parseMultiResult(result);
	return multiResult.score + 1 - multiResult.seconds / (60 * 60);
}