import {useParams} from "react-router";
import type {KinchEvent} from "@repo/common/types/kinch-types";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {ROUTES} from "@repo/app/routes";

export function PersonScoresPage() {
	const {wcaid} = useParams<{wcaid: string;}>();
	const {age, region, regionInfo} = useKinchContext();
	const {rankings} = useData();
	const kinchRanks = useKinchRanks({age, region});

	if (!wcaid) {
		return <div>Person not found</div>;
	}

	// Person data logic
	const getPersonData = () => {
		const rankIndex = kinchRanks.findIndex(kr => kr.personId === wcaid);
		if (rankIndex < 0) {
			const person = rankings.data.persons[rankings.personIdToIndex[wcaid]];
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
			return rankings.data.continents[rankings.continentIdToIndex[regionInfo.id]].name;
		}
		return rankings.data.countries[rankings.countryIdToIndex[regionInfo.id]].name;
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

	return (
		<KinchLayout>
			<PersonScores
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