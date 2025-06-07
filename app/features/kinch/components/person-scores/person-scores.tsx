import {useState} from "react";
import {Link} from "react-router";
import clsx from "clsx";
import {scoreAverageOnly, type KinchEvent, type KinchRank} from "@repo/common/types/kinch-types";
import {Card} from "@repo/app/components/card/card";
import styles from "./person-scores.module.css";

interface PersonScoresProps {
	// Pre-processed person data
	personKinchRank: KinchRank,
	kinchRanking: number,
	regionName: string,
	age: string,
	returnPath: string,
	getRankingUrl: (event: KinchEvent) => string,
	getShowInRankingsUrl: (targetPage: number) => string,
	rowsPerPage: number,
};

export function PersonScores(props: PersonScoresProps) {
	const {
		personKinchRank,
		kinchRanking,
		regionName,
		age,
		returnPath,
		getRankingUrl,
		getShowInRankingsUrl,
		rowsPerPage,
	} = props;
	const [sortBy, setSortBy] = useState<"event" | "score">("event");

	// Default: sort by WCA event sort order (kinchRank events are already in this order)
	const sortedEvents = [...personKinchRank.events];
	if (sortBy === "score") {
		sortedEvents.sort((a, b) => b.score - a.score);
	}

	const targetPage = Math.ceil(kinchRanking / rowsPerPage);
	const competitorURL = `https://www.worldcubeassociation.org/persons/${personKinchRank.personId}`;

	return (
		<div className={styles.personScores}>
			<Card>
				<h3 className={styles.personName}>
					<a className={styles.link} href={competitorURL} target="_blank">
						{personKinchRank.personName}
					</a>
				</h3>
				<div>
					{regionName}, {age}+
				</div>
				<div>
					Rank: #{kinchRanking} (
					<ShowInRankingsListLink
						targetPage={targetPage}
						wcaId={personKinchRank.personId}
						getShowInRankingsUrl={getShowInRankingsUrl}
					/>
					)
				</div>
				<div>
					Overall score: {personKinchRank.overall.toFixed(2)}
				</div>
				<Link className={styles.returnLink} to={returnPath}>
					← Return to previous view
				</Link>
			</Card>
			<table className={styles.table}>
				<thead>
					<tr>
						<th
							className={clsx(
								styles.tableHeader,
								styles.eventColumn,
								(sortBy === "event") && styles.sortedAsc
							)}
							onClick={() => setSortBy("event")}
						>
							Event
						</th>
						<th
							className={clsx(
								styles.tableHeader,
								styles.scoreColumn,
								(sortBy === "score") && styles.sortedDesc,
							)}
							onClick={() => setSortBy("score")}
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

interface ShowInRankingsListLinkProps {
	targetPage: number,
	wcaId: string,
	getShowInRankingsUrl: (targetPage: number) => string,
};

function ShowInRankingsListLink({targetPage, wcaId, getShowInRankingsUrl}: ShowInRankingsListLinkProps) {
	return (
		<Link to={getShowInRankingsUrl(targetPage)} state={{highlight: wcaId}}>
			Show in rankings list
		</Link>
	);
}
interface EventRowProps {
	event: KinchEvent,
	getRankingUrl: (event: KinchEvent) => string,
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
