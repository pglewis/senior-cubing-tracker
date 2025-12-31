import {Link, useParams} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import type {KinchEvent} from "@repo/common/types/kinch-types";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import styles from "./person-scores-page.module.css";

export function PersonScoresPage() {
	const {wcaid} = useParams<{wcaid: string;}>();
	const {age, region, regionInfo} = useKinchContext();
	const {rankings} = useData();
	const kinchRanks = useKinchRanks({age, region});

	const personId = wcaid || "";
	const person = rankings?.persons[personId];
	let rankIndex = -1;

	if (person) {
		rankIndex = kinchRanks.findIndex(kr => kr.personId === wcaid);
	}
	if (!person || rankIndex < 0) {
		return (
			<>
				<div className={styles["not-found"]}>
					<h2>Senior Kinch Ranks</h2>
					<p className={styles["not-found-text"]}>
						We were looking for someone&apos;s rankings but couldn&apos;t locate any results:
					</p>
					<p className={styles["not-found-text"]}>
						WCA ID: <code className={styles["highlighted-data"]}>{personId}</code><br />
						Age cateory: <code className={styles["highlighted-data"]}>{age}</code><br />
						Region: <code className={styles["highlighted-data"]}>{region}</code><br />
					</p>
					<Link to={`${ROUTES.KINCH_RANKS}?age=${age}&region=${region}`}>
						View the main Leaderboard
					</Link>
				</div>
			</>
		);
	}

	const ageOptions = person.availableAges
		.sort((a, b) => a - b)
		.map(age => ({value: age.toString(), label: `${age}+`}));

	const personKinchRank = kinchRanks[rankIndex];
	const ranking = rankIndex + 1;

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

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			<PersonScores
				countryCode={person.countryId || ""}
				regionName={getRegionName()}
				personKinchRank={personKinchRank}
				kinchRanking={ranking}
				rowsPerPage={25}
				returnPath={`${ROUTES.KINCH_RANKS}?age=${age}&region=${region}`}
				age={age}
				getRankingUrl={getRankingUrl}
				getShowInRankingsUrl={getShowInRankingsUrl}
			/>
		</KinchLayout>
	);
}