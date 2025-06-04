import {useMemo} from "react";
import {
	scoreAverageOnly,
	type KinchRank,
	type KinchEvent,
	type TopRank,
} from "@repo/common/types/kinch-types";
import type {
	ExtendedRankingsData,
	WCAEvent,
	EventRanking,
} from "@repo/common/types/rankings-snapshot";
import {timeResultToSeconds, parseMultiResult} from "@repo/common/util/parse";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {useData} from "@repo/app/hooks/use-data";

interface KinchFilters {
	age: string;
	region: string; // Prefixed region id (e.g. "CNA" or "NNA")
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

		let ranks = rankings.data.persons.map(p =>
			getRanksForPerson(rankings, topRanks, {
				age: filters.age,
				region: filters.region
			}, p.id)
		);

		ranks = ranks.filter(r => r.overall > 0);
		ranks.sort((a, b) => b.overall - a.overall);

		kinchCache.set(cacheKey, ranks);

		// Cleanup old entries periodically
		if (kinchCache.size > 50) {
			const keysToDelete = Array.from(kinchCache.keys()).slice(0, 10);
			keysToDelete.forEach(key => kinchCache.delete(key));
		}

		return ranks;
	}, [rankings, topRanks, filters.age, filters.region]);
}

function getRanksForPerson(
	rankings: ExtendedRankingsData,
	topRanks: TopRank[],
	filters: KinchFilters,
	personId: string,
): KinchRank {
	const rankingsData = rankings.data;
	const person = rankingsData.persons[rankings.personIdToIndex[personId]];
	if (!person) {
		throw new Error(`We were looking for someone's rankings but WCA ID "${personId}" was not found.`);
	}

	const kinchRank: KinchRank = {
		personId: personId,
		personName: person.name,
		overall: 0,
		events: [] as KinchEvent[]
	};

	const country = rankingsData.countries[rankings.countryIdToIndex[person.country]];
	const continent = rankingsData.continents[rankings.continentIdToIndex[country.continent]];

	// Check if person belongs to the selected region
	if (filters.region !== "world" &&
		filters.region !== toRegionParam(country.id, false) &&
		filters.region !== toRegionParam(continent.id, true)
	) {
		return kinchRank;
	}

	for (const event of rankingsData.events) {
		if (!person.events.includes(event.id)) {
			// They've never competed in this event at all
			kinchRank.events.push({
				eventId: event.id,
				eventName: event.name,
				score: 0,
				result: "",
				type: null,
			});
		} else if (event.id === "333mbf") {
			// Multi blind is a special case
			kinchRank.events.push(getPersonMultiScore(topRanks, personId, event, filters));
		} else if (scoreAverageOnly[event.id]) {
			// Use the average
			kinchRank.events.push(getPersonAverageScore(topRanks, personId, event, filters));
		} else {
			// best of single or average
			kinchRank.events.push(getPersonSingeleOrAverageScore(topRanks, personId, event, filters));
		}
	}

	kinchRank.overall = kinchRank.events.reduce((acc, current) => acc + current.score, 0) / kinchRank.events.length;
	return kinchRank;
}

function getTopRank(
	topRanks: TopRank[],
	eventId: string,
	type: EventRanking["type"],
	filters: KinchFilters
): TopRank | undefined {
	const topRank = topRanks.find(r =>
		r.eventId === eventId &&
		r.type === type &&
		r.age === Number(filters.age) &&
		r.region === filters.region // filters.region is already prefixed
	);

	return topRank;
}

function getPersonResult(
	event: WCAEvent,
	type: EventRanking["type"],
	personId: string,
	filters: KinchFilters
): string | undefined {
	const eventRanking = event.rankings.find(
		r => r.type === type
			&& r.age === Number(filters.age)
	);

	if (!eventRanking) {
		return undefined;
	}

	const rank = eventRanking.ranks.find(r => r.id === personId);
	if (!rank) {
		return undefined;
	}

	return rank.best;
}

function getPersonAverageScore(
	topRanks: TopRank[],
	personId: string,
	event: WCAEvent,
	filters: KinchFilters
): KinchEvent {
	const topRank = getTopRank(topRanks, event.id, "average", filters);
	const result = getPersonResult(event, "average", personId, filters);

	if (!result || !topRank) {
		return {
			eventId: event.id,
			eventName: event.name,
			score: 0,
			result: "",
			type: null,
		};
	}

	return {
		eventId: event.id,
		eventName: event.name,
		score: getPersonScore(event.format, topRank, result),
		result: result,
		type: "average",
	};
}

function getPersonSingeleOrAverageScore(
	topRanks: TopRank[],
	personId: string,
	event: WCAEvent,
	filters: KinchFilters
): KinchEvent {
	const singleTopRank = getTopRank(topRanks, event.id, "single", filters);
	const averageTopRank = getTopRank(topRanks, event.id, "average", filters);
	const singleResult = getPersonResult(event, "single", personId, filters);
	const averageResult = getPersonResult(event, "average", personId, filters);

	if (!singleResult || !singleTopRank) {
		// We can end up here if they've competed in the event but not in this age bracket
		return {
			eventId: event.id,
			eventName: event.name,
			score: 0,
			result: "",
			type: null,
		};
	}

	let result: string;
	let score = 0;
	let type: KinchEvent["type"];
	const singleScore = getPersonScore(event.format, singleTopRank, singleResult);
	if (averageResult && averageTopRank) {
		const averageScore = getPersonScore(event.format, averageTopRank, averageResult);

		// They have both a single and average, pick the best score of the two
		if (singleScore > averageScore) {
			score = singleScore;
			result = singleResult;
			type = "single";
		} else {
			score = averageScore;
			result = averageResult;
			type = "average";
		}
	} else {
		score = singleScore;
		result = singleResult;
		type = "single";
	}

	return {
		eventId: event.id,
		eventName: event.name,
		score: score,
		result: result,
		type: type,
	};
}

function getPersonScore(
	format: WCAEvent["format"],
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
	personId: string,
	event: WCAEvent,
	filters: KinchFilters
): KinchEvent {
	const topRank = getTopRank(topRanks, event.id, "single", filters); // We just use single for mbld
	const result = getPersonResult(event, "single", personId, filters);

	if (!result || !topRank) {
		return {
			eventId: event.id,
			eventName: event.name,
			score: 0,
			result: "",
			type: null,
		};
	}

	// Bigger result is better for mbld, so the division is reversed
	return {
		eventId: event.id,
		eventName: event.name,
		score: (getKinchMultiScore(result) / getKinchMultiScore(topRank.result)) * 100,
		result: result,
		type: "single",
	};
}

function getKinchMultiScore(result: string) {
	const multiResult = parseMultiResult(result);
	return multiResult.score + 1 - multiResult.seconds / (60 * 60);
}