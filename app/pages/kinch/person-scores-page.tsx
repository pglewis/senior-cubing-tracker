import {useMemo} from "react";
import {useParams} from "react-router";
import {ROUTES} from "@repo/app/routes";
import type {KinchEvent} from "@repo/common/types/kinch-types";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";

export function PersonScoresPage() {
	const {wcaid} = useParams<{wcaid: string;}>();
	const {age, region, regionInfo} = useKinchContext();
	const {rankings, topRanks} = useData();
	const kinchRanks = useKinchRanks({age, region});

	// Calculate available age options for this specific person
	const ageOptions = useMemo(() => {
		if (!rankings || !topRanks || !wcaid) return [];

		// Find all age groups where this person has results
		const personAges = new Set<number>();

		// Search through enhanced rankings results to find where this person appears
		const personResults = rankings.results.filter(result => result.personId === wcaid);
		for (const result of personResults) {
			personAges.add(result.age);
		}

		// Get person's country and continent for region filtering
		const person = rankings.persons[wcaid];
		const personCountry = person?.countryId;
		const personContinent = person?.continentId;

		// Person scores page only shows: World, person's country, and person's continent
		const allowedRegions = new Set(["world"]);
		if (personCountry) allowedRegions.add(personCountry);
		if (personContinent) allowedRegions.add(personContinent);

		// Filter topRanks ages by allowed regions and person's available ages
		return Array.from(new Set(topRanks
			.filter(tr => allowedRegions.has(tr.region))
			.map(tr => tr.age)
			.filter(age => personAges.has(age))
		))
			.sort((a, b) => a - b)
			.map(age => ({value: age.toString(), label: `${age}+`}));
	}, [rankings, topRanks, wcaid]);

	// Person data logic
	const getPersonData = () => {
		if (!wcaid) {
			return {
				type: "not-found" as const,
				person: null,
				wcaId: wcaid
			};
		}

		const rankIndex = kinchRanks.findIndex(kr => kr.personId === wcaid);
		if (rankIndex < 0) {
			const person = rankings?.persons[wcaid];
			return {
				type: "not-found" as const,
				person,
				wcaId: wcaid
			};
		}

		return {
			type: "found" as const,
			personKinchRank: kinchRanks[rankIndex],
			ranking: rankIndex + 1,
		};
	};

	const personData = getPersonData();

	if (personData.type === "not-found") {
		return <div>Person not found in rankings</div>;
	}

	// Helper functions
	const getRegionName = () => {
		if (regionInfo.type === "world") return "World";
		if (regionInfo.type === "continent") {
			return rankings?.continents[regionInfo.id]?.name || regionInfo.id;
		}
		return rankings?.countries[regionInfo.id]?.name || regionInfo.id;
	};

	const getRankingUrl = (event: KinchEvent) => {
		const baseRankingURL = "https://wca-seniors.org/Senior_Rankings.html";
		let regionParam = "";
		if (regionInfo.type === "continent") {
			regionParam = "-" + regionInfo.id.toLowerCase();
		} else if (regionInfo.type === "country") {
			regionParam = "-xx-" + regionInfo.id.toLowerCase();
		}
		return `${baseRankingURL}#${event.eventId}-${event.type}-${age}${regionParam}`;
	};

	const getShowInRankingsUrl = (targetPage: number) => {
		return `${ROUTES.KINCH_RANKS}?page=${targetPage}&age=${age}&region=${region}`;
	};

	const person = rankings?.persons[wcaid as string];

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			<PersonScores
				countryCode={person?.countryId || ""}
				regionName={getRegionName()}
				personKinchRank={personData.personKinchRank}
				kinchRanking={personData.ranking}
				rowsPerPage={25}
				returnPath={`${ROUTES.KINCH_RANKS}?age=${age}&region=${region}`}
				age={age}
				getRankingUrl={getRankingUrl}
				getShowInRankingsUrl={getShowInRankingsUrl}
			/>
		</KinchLayout>
	);
}