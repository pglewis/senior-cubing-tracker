import {useState} from "react";
import {Link} from "react-router";
import clsx from "clsx";
import {scoreAverageOnly, type KinchEvent, type KinchRank} from "@repo/common/types/kinch-types";
import {buildProfilePersonRoute} from "@repo/app/routing/routes";
import {Card} from "@repo/app/components/card/card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {dateIsRecent} from "@repo/common/util/parse";
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
		returnPath,
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
	const competitorURL = `${buildProfilePersonRoute(personKinchRank.personId)}?age=${age}`;

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
			<Card className="personCard">
				<div className={styles["person-header"]}>
					<CountryFlag countryCode={countryCode} />
					<h3 className={styles["person-name"]}>
						<Link className={styles.link} to={competitorURL}>
							{personKinchRank.personName}
						</Link>
					</h3>
				</div>
				<div className={styles.personRegionAge}>
					<Link to={returnPath} className={styles.link}>
						{regionName}, {age}+
					</Link>
				</div>
				<div className={styles.personRank}>
					Rank:{" "}
					<Link to={getShowInRankingsUrl(targetPage)} className={styles["person-rank-link"]} state={{highlight: personKinchRank.personId}}>
						#{kinchRanking}
					</Link>
				</div>
				<div className={styles.personOverallScore}>
					Overall score: {personKinchRank.overall.toFixed(2)}
				</div>
				{/* <Link className={styles["return-link"]} to={returnPath}>
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
								styles["table-header"],
								styles["event-column"],
								styles["event-column-header"],
								sortBy === "event" && styles["sorted-asc"]
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
								styles["table-header"],
								styles["score-column"],
								styles["score-column-header"],
								sortBy === "score" && styles["sorted-desc"],
							)}
							tabIndex={0}
							onClick={() => handleSort("score")}
							onKeyDown={(e) => handleKeyDown(e, "score")}
							aria-sort={sortBy === "score" ? "descending" : "none"}
							aria-label="Score, sortable column"
						>
							Score
						</th>
						<th className={clsx(styles["table-header"], styles["result-column"])}>
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
	const {eventName, score, result, type, date} = event;

	const isRecent = date && dateIsRecent(date);

	let scoreClass;
	let scoreDisplay = score.toFixed(2);
	if (score >= 100) {
		scoreClass = styles["top-score"];
	} else if (score >= 90) {
		scoreClass = styles["high-score"];
	} else if (score >= 80) {
		scoreClass = styles["good-score"];
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
			<td className={styles["event-column"]}>{eventName} {isRecent && "🔥"}</td>
			<td className={styles["score-column"]}>{scoreDisplay}</td>
			<td className={styles["result-column"]}>{resultText}</td>
		</tr>
	);
}