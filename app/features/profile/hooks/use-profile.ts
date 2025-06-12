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
  };

  // Individual event breakdown from kinch calculation
  eventResults: KinchRank["events"];

  // Available age categories for this person
  availableAges: string[];

  // Loading/error states
  isLoading: boolean;
  error: string | null;
}

interface UseProfileParams {
  wcaId: string;
  age: string;
}

export function useProfile({wcaId, age}: UseProfileParams): ProfileData {
	const {rankings, topRanks, isInitializing} = useData();

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

	// Extract this person's scores from each ranking
	const profileData = useMemo(() => {
		if (!person || !rankings) {
			return {
				kinchScores: {world: 0, continent: 0, country: 0},
				eventResults: [],
			};
		}

		const worldRank = worldKinchRanks.find(rank => rank.personId === wcaId);
		const continentRank = continentKinchRanks.find(rank => rank.personId === wcaId);
		const countryRank = countryKinchRanks.find(rank => rank.personId === wcaId);

		return {
			kinchScores: {
				world: worldRank?.overall || 0,
				continent: continentRank?.overall || 0,
				country: countryRank?.overall || 0,
			},
			eventResults: worldRank?.events || [],
		};
	}, [person, rankings, wcaId, worldKinchRanks, continentKinchRanks, countryKinchRanks]);

	// Handle loading and error states
	const isLoading = isInitializing || !rankings || !topRanks;
	const error = (!person && !isLoading && wcaId) ? `Person with ID "${wcaId}" not found` : null;

	return {
		person,
		kinchScores: profileData.kinchScores,
		eventResults: profileData.eventResults,
		availableAges,
		isLoading,
		error,
	};
}