import {useEffect, useRef} from "react";
import styles from "./kinch-leaderboard.module.css";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";

const ROWS_PER_PAGE = 25;

interface KinchLeaderboardProps {
    age: string;
    region: string;
    highlightId?: string;
}

export function KinchLeaderboard({age, region, highlightId}: KinchLeaderboardProps) {
	const kinchRanks = useKinchRanks({age, region});
	const {page, setParams} = useKinchContext();
	const highlightRef = useRef<HTMLTableRowElement>(null);

	const startIdx = (page - 1) * ROWS_PER_PAGE;
	const endIdx = startIdx + ROWS_PER_PAGE;
	const displayRanks = kinchRanks.slice(startIdx, endIdx);

	useEffect(() => {
		if (highlightId && highlightRef.current) {
			highlightRef.current.scrollIntoView();
		}
	}, [highlightId]);

	return (
		<table className={styles.table}>
			<tbody>
				<tr>
					<th className={styles.rankColumn}>#</th>
					<th className={styles.nameColumn}>Name</th>
					<th className={styles.scoreColumn}>Score</th>
				</tr>
				{displayRanks.map((rank, index) => (
					<tr
						key={rank.personID}
						ref={rank.personID === highlightId ? highlightRef : null}
						className={`${styles.row} ${rank.personID === highlightId ? styles.highlighted : ""}`}
					>
						<td className={styles.rankColumn}>{startIdx + index + 1}</td>
						<td className={styles.nameColumn}>
							<a
								href="#"
								className={styles.link}
								onClick={(e) => {
									e.preventDefault();
									setParams({wcaid: rank.personID, region: "world"});
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