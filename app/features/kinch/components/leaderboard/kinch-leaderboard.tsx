import {useEffect, useRef} from "react";
import {Link} from "react-router";
import type {KinchRank} from "@repo/common/types/kinch-types";
import {dateIsRecent} from "@repo/common/util/parse";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {Pill} from "@repo/app/components/pill/pill";
import styles from "./kinch-leaderboard.module.css";
interface KinchLeaderboardProps {
	displayRanks: KinchRank[],
	getPersonUrl: (personId: string) => string,
	highlightId?: string,
};

export function KinchLeaderboard({displayRanks, getPersonUrl, highlightId}: KinchLeaderboardProps) {
	const {rankings} = useData();
	const {age} = useKinchContext();
	const currentAge = parseInt(age);
	const highlightRef = useRef<HTMLTableRowElement>(null);

	useEffect(() => {
		if (highlightId && highlightRef.current) {
			highlightRef.current.scrollIntoView();
		}
	}, [highlightId]);

	return (
		<table className={styles.table}>
			<thead>
				<tr>
					<th className={styles["rank-column"]}>#</th>
					<th className={styles["name-column"]}>Name</th>
					<th className={styles["score-column"]}>Score</th>
				</tr>
			</thead>
			<tbody>
				{displayRanks.map((rank) => {
					const hasRecentPB = rank.events.some(event => event.date && dateIsRecent(event.date));
					const person = rankings?.persons[rank.personId];
					const highestAge = person?.availableAges.at(-1);
					const showHighestAge = highestAge !== undefined && highestAge > currentAge;
					return (
						<tr
							key={rank.personId}
							ref={rank.personId === highlightId ? highlightRef : null}
							className={`${styles.row} ${rank.personId === highlightId ? styles.highlighted : ""}`}
						>
							<td className={styles["rank-column"]}>{rank.displayRank}</td>
							<td className={styles["name-column"]}>
								<CountryFlag
									countryCode={person?.countryId ?? ""}
									size="small"
									decorative
								/>
								{" "}
								<Link
									to={getPersonUrl(rank.personId)}
									className={styles.link}
								>
									{rank.personName}
								</Link>
								{showHighestAge && <Pill>({highestAge})</Pill>}
								{hasRecentPB && " 🔥"}
							</td>
							<td className={styles["score-column"]}>{rank.overall.toFixed(2)}</td>
						</tr>
					);
				})}
			</tbody>
		</table>
	);
}