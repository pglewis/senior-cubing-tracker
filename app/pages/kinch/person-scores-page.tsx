import {useMemo} from "react";
import {Link, useParams} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import {getAchievementAges} from "@repo/common/util/achievement-age";
import {getRegionName} from "@repo/common/util/region-utils";
import {useData} from "@repo/app/hooks/use-data";
import {getAgeOptions} from "@repo/app/utils/age-options";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import styles from "./person-scores-page.module.css";

export function PersonScoresPage() {
	const {wcaid} = useParams<{wcaid: string;}>();
	const {age, region} = useKinchContext();
	const {rankings} = useData();
	const {getPersonRank} = useKinchRanks({age, region});
	const personId = wcaid || "";
	const person = rankings?.persons[personId];
	const personKinchRank = getPersonRank(personId);

	const achievementAges = useMemo(() => getAchievementAges(rankings, personId), [rankings, personId]);

	if (!person || !personKinchRank) {
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
						View the Kinch Ranks Leaderboard
					</Link>
				</div>
			</>
		);
	}

	const ageOptions = getAgeOptions(person.availableAges);

	const getShowInRankingsUrl = (targetPage: number) => {
		return `${ROUTES.KINCH_RANKS}?page=${targetPage}&age=${age}&region=${region}`;
	};

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			<PersonScores
				countryCode={person.countryId || ""}
				regionName={getRegionName(rankings, region)}
				personKinchRank={personKinchRank}
				rowsPerPage={25}
				returnPath={`${ROUTES.KINCH_RANKS}?age=${age}&region=${region}`}
				age={age}
				region={region}
				achievementAges={achievementAges}
				getShowInRankingsUrl={getShowInRankingsUrl}
			/>
		</KinchLayout>
	);
}