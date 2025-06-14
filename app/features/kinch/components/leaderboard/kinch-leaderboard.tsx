import {useEffect, useRef} from "react";
import {Link} from "react-router";
import {buildProfileRoute} from "@repo/app/routes";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import type {KinchRank} from "@repo/common/types/kinch-types";
import styles from "./kinch-leaderboard.module.css";

interface KinchLeaderboardProps {
	displayRanks: KinchRank[],
	startIdx: number,
	highlightId?: string,
};

export function KinchLeaderboard({displayRanks, startIdx, highlightId}: KinchLeaderboardProps) {
	const highlightRef = useRef<HTMLTableRowElement>(null);
	const {age} = useKinchContext();

	useEffect(() => {
		if (highlightId && highlightRef.current) {
			highlightRef.current.scrollIntoView();
		}
	}, [highlightId]);

	return (
		<table className={styles.table}>
			<thead>
				<tr>
					<th className={styles.rankColumn}>#</th>
					<th className={styles.nameColumn}>Name</th>
					<th className={styles.scoreColumn}>Score</th>
				</tr>
			</thead>
			<tbody>
				{displayRanks.map((rank, index) => (
					<tr
						key={rank.personId}
						ref={rank.personId === highlightId ? highlightRef : null}
						className={`${styles.row} ${rank.personId === highlightId ? styles.highlighted : ""}`}
					>
						<td className={styles.rankColumn}>{startIdx + index + 1}</td>
						<td className={styles.nameColumn}>
							<Link
								to={`${buildProfileRoute(rank.personId)}?age=${age}`}
								className={styles.link}
							>
								{rank.personName}
							</Link>
						</td>
						<td className={styles.scoreColumn}>{rank.overall.toFixed(2)}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}