import {useMemo} from "react";
import {useDataOptional} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {toRegionParam} from "@repo/common/util/region-utils";
import {getAchievementAges, getResultKey} from "@repo/common/util/achievement-age";
import type {PersonProfile, FlatResult} from "@repo/common/types/enhanced-rankings";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";

interface ProfileResult {
	result: string;
	date: string;
	worldRank: number;
	continentRank: number;
	countryRank: number;
	achievementAge: number;
}

export interface EventResult {
	eventId: WCAEventId;
	eventName: string;
	single?: ProfileResult;
	average?: ProfileResult;
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
	const {rankings} = useDataOptional();

	// Get person data
	const person = useMemo(() => {
		if (!rankings || !wcaId) {
			return null;
		}
		return rankings.persons[wcaId] || null;
	}, [rankings, wcaId]);

	// Get available age categories from person profile
	const availableAges = useMemo(() => {
		if (!person) {
			return [];
		}
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
		if (!rankings || !person || !age) {
			return [];
		}

		const targetAge = parseInt(age);

		const achievementAges = getAchievementAges(rankings, person.personId);
		const toProfileResult = (r: FlatResult): ProfileResult => ({
			result: r.result,
			date: rankings.competitions[r.competitionId].startDate,
			worldRank: r.worldRank,
			continentRank: r.continentRank,
			countryRank: r.countryRank,
			achievementAge: achievementAges.get(getResultKey(r)) ?? r.age,
		});

		const personResults = person.resultIndices
			.map(i => rankings.results[i])
			.filter(r => r.age === targetAge);

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
		const worldKinchRank = worldKinchRanks.getPersonRank(wcaId);
		const continentKinchRank = continentKinchRanks.getPersonRank(wcaId);
		const countryKinchRank = countryKinchRanks.getPersonRank(wcaId);

		// Convert to EventResult format
		const events: EventResult[] = [];

		for (const [eventId, results] of resultsByEvent) {
			const eventResult: EventResult = {
				eventId,
				eventName: rankings.events[eventId].name,
				single: results.single && toProfileResult(results.single),
				average: results.average && toProfileResult(results.average),
			};

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

		const worldRank = worldKinchRanks.getPersonRank(wcaId);
		const continentRank = continentKinchRanks.getPersonRank(wcaId);
		const countryRank = countryKinchRanks.getPersonRank(wcaId);

		return {
			world: worldRank?.overall || 0,
			continent: continentRank?.overall || 0,
			country: countryRank?.overall || 0,
			worldRank: worldRank?.displayRank || 0,
			continentRank: continentRank?.displayRank || 0,
			countryRank: countryRank?.displayRank || 0,
		};
	}, [person, wcaId, worldKinchRanks, continentKinchRanks, countryKinchRanks]);

	return {
		person,
		kinchScores,
		eventResults,
		availableAges,
	};
}