import {useKinchRanks} from "@repo/app/hooks/use-kinch-ranks";
import {useKinchParams, type KinchParams} from "@repo/app/hooks/use-kinch-params";
import styles from "./kinch-leaderboard.module.css";
import type {KinchRank} from "@repo/common/types/kinch-types";

const ROWS_PER_PAGE = 25;

interface KinchLeaderboardProps {
	age: string;
	region: string;
}

export function KinchLeaderboard({age, region}: KinchLeaderboardProps) {
	const kinchRanks = useKinchRanks({age, region});
	const {page, setParams} = useKinchParams(); // Add setParams

	const startIdx = (page - 1) * ROWS_PER_PAGE;
	const endIdx = startIdx + ROWS_PER_PAGE;
	const displayRanks = kinchRanks.slice(startIdx, endIdx);

	return (
		<table className={styles.table}>
			<tbody>
				<tr>
					<th className={styles.rankColumn}>#</th>
					<th className={styles.nameColumn}>Name</th>
					<th className={styles.scoreColumn}>Score</th>
				</tr>
				{displayRanks.map((rank, index) => (
					<LeaderboardRow
						key={rank.personID}
						rank={rank}
						ranking={startIdx + index + 1}
						setParams={setParams} // Pass setParams to row
					/>
				))}
			</tbody>
		</table>
	);
}

interface LeaderboardRowProps {
	rank: KinchRank;
	ranking: number;
	setParams: (params: Partial<KinchParams>) => void; // Add to props
}

function LeaderboardRow({rank, ranking, setParams}: LeaderboardRowProps) {
	const {personID, personName, overall} = rank;

	return (
		<tr className={styles.row}>
			<td className={styles.rankColumn}>{ranking}</td>
			<td className={styles.nameColumn}>
				<a
					href="#"
					className={styles.link}
					onClick={(e) => {
						e.preventDefault();
						setParams({wcaid: personID, region: "world"});
					}}
				>
					{personName}
				</a>
			</td>
			<td className={styles.scoreColumn}>{overall.toFixed(2)}</td>
		</tr>
	);
}