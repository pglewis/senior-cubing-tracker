import {useEffect, useRef} from "react";
import type {KinchRank} from "@repo/common/types/kinch-types";
import styles from "./kinch-leaderboard.module.css";
interface KinchLeaderboardProps {
	displayRanks: KinchRank[],
	startIdx: number,
	onNameClick: (personId: string) => void,
	highlightId?: string,
};

export function KinchLeaderboard({displayRanks, startIdx, onNameClick, highlightId}: KinchLeaderboardProps) {
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
							<a
								href="#"
								className={styles.link}
								onClick={(e) => {
									e.preventDefault();
									onNameClick(rank.personId);
								}}
							>
								{rank.personName}
							</a>
						</td>
						<td className={styles.scoreColumn}>{rank.overall.toFixed(2)}</td>
					</tr>
				))}
			</tbody>
		</table>
	);
}