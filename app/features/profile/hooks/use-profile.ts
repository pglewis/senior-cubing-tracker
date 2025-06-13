import {useMemo} from "react";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import type {KinchRank} from "@repo/common/types/kinch-types";
import type {PersonProfile} from "@repo/common/types/enhanced-rankings";

interface ProfileData {
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

  // Individual event breakdown from kinch calculation
  eventResults: KinchRank["events"];

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

	// Extract this person's scores and rankings from each ranking list
	const profileData = useMemo(() => {
		if (!person) {
			return {
				kinchScores: {
					world: 0,
					continent: 0,
					country: 0,
					worldRank: 0,
					continentRank: 0,
					countryRank: 0
				},
				eventResults: [],
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
			kinchScores: {
				world: worldRank?.overall || 0,
				continent: continentRank?.overall || 0,
				country: countryRank?.overall || 0,
				// Ranking positions are 1-indexed (add 1 to array index)
				worldRank: worldRankIndex >= 0 ? worldRankIndex + 1 : 0,
				continentRank: continentRankIndex >= 0 ? continentRankIndex + 1 : 0,
				countryRank: countryRankIndex >= 0 ? countryRankIndex + 1 : 0,
			},
			eventResults: worldRank?.events || [],
		};
	}, [person, wcaId, worldKinchRanks, continentKinchRanks, countryKinchRanks]);

	return {
		person,
		kinchScores: profileData.kinchScores,
		eventResults: profileData.eventResults,
		availableAges,
	};
}