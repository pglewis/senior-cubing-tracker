import {useEffect, useRef} from "react";
import {useLocation, useNavigate} from "react-router-dom";
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
	const {page} = useKinchContext();
	const highlightRef = useRef<HTMLTableRowElement>(null);
	const navigate = useNavigate();
	const location = useLocation();

	const startIdx = (page - 1) * ROWS_PER_PAGE;
	const endIdx = startIdx + ROWS_PER_PAGE;
	const displayRanks = kinchRanks.slice(startIdx, endIdx);

	useEffect(() => {
		if (highlightId && highlightRef.current) {
			highlightRef.current.scrollIntoView();
		}
	}, [highlightId]);

	const handleNameClick = (personId: string) => {
		// Build the return URL with current params
		const currentUrl = `${location.pathname}${location.search}`;

		// Navigate to person view with state
		navigate(`/kinch-ranks?wcaid=${personId}&age=${age}&region=${region}`, {
			state: {from: currentUrl}
		});
	};

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
									handleNameClick(rank.personId);
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