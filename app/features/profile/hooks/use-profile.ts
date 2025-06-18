import {useMemo} from "react";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import type {PersonProfile, FlatResult} from "@repo/common/types/enhanced-rankings";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";

export interface EventResult {
  eventId: WCAEventId;
  eventName: string;
  single?: {
    result: string;
    worldRank: number;
    continentRank: number;
    countryRank: number;
  };
  average?: {
    result: string;
    worldRank: number;
    continentRank: number;
    countryRank: number;
  };
  kinchScores?: {
    world: number;
    continent: number;
    country: number;
  };
}

export interface ProfileData {
  // Person details
  person: PersonProfile | null;

  // Kinch scores for the selected age/region
  kinchScores: {
    world: number;
    continent: number;
    country: number;
    worldRank: number;
    continentRank: number;
    countryRank: number;
  };

  // Event results with rankings for the selected age
  eventResults: EventResult[];

  // Available age categories for this person
  availableAges: string[];
}

interface UseProfileParams {
  wcaId: string;
  age: string;
}

export function useProfile({wcaId, age}: UseProfileParams): ProfileData {
	const {rankings} = useData();

	// Get person data
	const person = useMemo(() => {
		if (!rankings || !wcaId) return null;
		return rankings.persons[wcaId] || null;
	}, [rankings, wcaId]);

	// Get available age categories from person profile
	const availableAges = useMemo(() => {
		if (!person) return [];
		return person.availableAges.map(age => age.toString());
	}, [person]);

	// Get kinch scores for world rankings
	const worldKinchRanks = useKinchRanks({
		age,
		region: "world"
	});

	// Get kinch scores for continent rankings
	const continentKinchRanks = useKinchRanks({
		age,
		region: person ? toRegionParam(person.continentId, true) : "world"
	});

	// Get kinch scores for country rankings
	const countryKinchRanks = useKinchRanks({
		age,
		region: person ? toRegionParam(person.countryId, false) : "world"
	});

	// Get event results for the selected age
	const eventResults = useMemo(() => {
		if (!rankings || !person || !age) return [];

		const targetAge = parseInt(age);

		// Get all results for this person at the target age
		const personResults = rankings.results.filter(result =>
			result.personId === wcaId && result.age === targetAge
		);

		// Group results by event
		const resultsByEvent = new Map<WCAEventId, {single?: FlatResult, average?: FlatResult}>();

		for (const result of personResults) {
			if (!resultsByEvent.has(result.eventId)) {
				resultsByEvent.set(result.eventId, {});
			}

			const eventResults = resultsByEvent.get(result.eventId)!;
			if (result.type === "single") {
				eventResults.single = result;
			} else if (result.type === "average") {
				eventResults.average = result;
			}
		}

		// Get kinch event scores for this person
		const worldKinchRank = worldKinchRanks.find(rank => rank.personId === wcaId);
		const continentKinchRank = continentKinchRanks.find(rank => rank.personId === wcaId);
		const countryKinchRank = countryKinchRanks.find(rank => rank.personId === wcaId);

		// Convert to EventResult format
		const events: EventResult[] = [];

		for (const [eventId, results] of resultsByEvent) {
			const eventResult: EventResult = {
				eventId,
				eventName: rankings.events[eventId].name,
			};

			if (results.single) {
				eventResult.single = {
					result: results.single.result,
					worldRank: results.single.worldRank,
					continentRank: results.single.continentRank,
					countryRank: results.single.countryRank,
				};
			}

			if (results.average) {
				eventResult.average = {
					result: results.average.result,
					worldRank: results.average.worldRank,
					continentRank: results.average.continentRank,
					countryRank: results.average.countryRank,
				};
			}

			// Add kinch scores for this event
			const worldKinchEvent = worldKinchRank?.events.find(e => e.eventId === eventId);
			const continentKinchEvent = continentKinchRank?.events.find(e => e.eventId === eventId);
			const countryKinchEvent = countryKinchRank?.events.find(e => e.eventId === eventId);

			if (worldKinchEvent || continentKinchEvent || countryKinchEvent) {
				eventResult.kinchScores = {
					world: worldKinchEvent?.score || 0,
					continent: continentKinchEvent?.score || 0,
					country: countryKinchEvent?.score || 0,
				};
			}

			events.push(eventResult);
		}

		// Sort by event order from rankings data
		events.sort((a, b) => {
			const aIndex = rankings.eventOrder.indexOf(a.eventId);
			const bIndex = rankings.eventOrder.indexOf(b.eventId);
			return aIndex - bIndex;
		});

		return events;
	}, [rankings, person, wcaId, age, worldKinchRanks, continentKinchRanks, countryKinchRanks]);

	// Extract kinch scores and rankings
	const kinchScores = useMemo(() => {
		if (!person) {
			return {
				world: 0,
				continent: 0,
				country: 0,
				worldRank: 0,
				continentRank: 0,
				countryRank: 0
			};
		}

		// Find the person's entry in each ranking list and get their position
		const worldRankIndex = worldKinchRanks.findIndex(rank => rank.personId === wcaId);
		const continentRankIndex = continentKinchRanks.findIndex(rank => rank.personId === wcaId);
		const countryRankIndex = countryKinchRanks.findIndex(rank => rank.personId === wcaId);

		const worldRank = worldKinchRanks[worldRankIndex];
		const continentRank = continentKinchRanks[continentRankIndex];
		const countryRank = countryKinchRanks[countryRankIndex];

		return {
			world: worldRank?.overall || 0,
			continent: continentRank?.overall || 0,
			country: countryRank?.overall || 0,
			// Ranking positions are 1-indexed (add 1 to array index)
			worldRank: worldRankIndex >= 0 ? worldRankIndex + 1 : 0,
			continentRank: continentRankIndex >= 0 ? continentRankIndex + 1 : 0,
			countryRank: countryRankIndex >= 0 ? countryRankIndex + 1 : 0,
		};
	}, [person, wcaId, worldKinchRanks, continentKinchRanks, countryKinchRanks]);

	return {
		person,
		kinchScores,
		eventResults,
		availableAges,
	};
}