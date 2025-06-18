import {useState} from "react";
import {Link} from "react-router";
import clsx from "clsx";
import {scoreAverageOnly, type KinchEvent, type KinchRank} from "@repo/common/types/kinch-types";
import {buildProfileRoute} from "@repo/app/routes";
import {Card} from "@repo/app/components/card/card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import styles from "./person-scores.module.css";

interface PersonScoresProps {
	// Pre-processed person data
	personKinchRank: KinchRank,
	kinchRanking: number,
	countryCode: string,
	regionName: string,
	age: string,
	returnPath: string,
	getRankingUrl: (event: KinchEvent) => string,
	getShowInRankingsUrl: (targetPage: number) => string,
	rowsPerPage: number,
};

type SortColumn = "event" | "score";

export function PersonScores(props: PersonScoresProps) {
	const {
		personKinchRank,
		kinchRanking,
		countryCode,
		regionName,
		age,
		// returnPath,
		getRankingUrl,
		getShowInRankingsUrl,
		rowsPerPage,
	} = props;
	const [sortBy, setSortBy] = useState<SortColumn>("event");

	// Default: sort by WCA event sort order (kinchRank events are already in this order)
	const sortedEvents = [...personKinchRank.events];
	if (sortBy === "score") {
		sortedEvents.sort((a, b) => b.score - a.score);
	}

	const targetPage = Math.ceil(kinchRanking / rowsPerPage);
	const competitorURL = `${buildProfileRoute(personKinchRank.personId)}?age=${age}`;

	const handleSort = (column: SortColumn) => {
		setSortBy(column);
	};

	const handleKeyDown = (event: React.KeyboardEvent, column: SortColumn) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			handleSort(column);
		}
	};

	return (
		<div className={styles.personScores}>
			<Card>
				<div className={styles.personHeader}>
					<CountryFlag countryCode={countryCode} />
					<h3 className={styles.personName}>
						<Link className={styles.link} to={competitorURL}>
							{personKinchRank.personName}
						</Link>
					</h3>
				</div>
				<div>
					{regionName}, {age}+
				</div>
				<div>
					Rank: #{kinchRanking} (
					<Link to={getShowInRankingsUrl(targetPage)} state={{highlight: personKinchRank.personId}}>
						Show on leaderboard
					</Link>
					)
				</div>
				<div>
					Overall score: {personKinchRank.overall.toFixed(2)}
				</div>
				{/* <Link className={styles.returnLink} to={returnPath}>
					← Return to previous view
				</Link> */}
			</Card>
			<table className={styles.table}>
				<caption className="sr-only">
					Event scores for {personKinchRank.personName}. Use the column headers to sort the table.
				</caption>
				<thead>
					<tr>
						<th
							className={clsx(
								styles.tableHeader,
								styles.eventColumn,
								sortBy === "event" && styles.sortedAsc
							)}
							tabIndex={0}
							onClick={() => handleSort("event")}
							onKeyDown={(e) => handleKeyDown(e, "event")}
							aria-sort={sortBy === "event" ? "ascending" : "none"}
							aria-label="Event name, sortable column"
						>
							Event
						</th>
						<th
							className={clsx(
								styles.tableHeader,
								styles.scoreColumn,
								sortBy === "score" && styles.sortedDesc,
							)}
							tabIndex={0}
							onClick={() => handleSort("score")}
							onKeyDown={(e) => handleKeyDown(e, "score")}
							aria-sort={sortBy === "score" ? "descending" : "none"}
							aria-label="Score, sortable column"
						>
							Score
						</th>
						<th className={clsx(styles.tableHeader, styles.resultColumn)}>
							Result
						</th>
					</tr>
				</thead>
				<tbody>
					{sortedEvents.map(event => (
						<EventRow
							key={event.eventId}
							event={event}
							getRankingUrl={getRankingUrl}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

interface EventRowProps {
	event: KinchEvent;
	getRankingUrl: (event: KinchEvent) => string;
}

function EventRow({event, getRankingUrl}: EventRowProps) {
	const {eventName, score, result, type} = event;

	let scoreClass;
	let scoreDisplay = score.toFixed(2);
	if (score >= 100) {
		scoreClass = styles.topScore;
	} else if (score >= 90) {
		scoreClass = styles.highScore;
	} else if (score >= 80) {
		scoreClass = styles.goodScore;
	} else if (score === 0) {
		scoreDisplay = "--";
	}

	let resultText: string | React.ReactNode = "--";
	if (result) {
		const rankingURL = getRankingUrl(event);

		let resultType = "";
		if (event.eventId !== "333mbf" && !scoreAverageOnly[event.eventId]) {
			resultType = type === "single" ? " (sing)" : " (avg)";
		}

		resultText = (
			<a className={styles.link} href={rankingURL} target="_blank" rel="noopener noreferrer">
				{result}{resultType}
			</a>
		);
	}

	return (
		<tr className={clsx(styles.row, scoreClass)}>
			<td className={styles.eventColumn}>{eventName}</td>
			<td className={styles.scoreColumn}>{scoreDisplay}</td>
			<td className={styles.resultColumn}>{resultText}</td>
		</tr>
	);
}