import {useState, type JSX} from "react";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/hooks/use-kinch-ranks";
import {scoreAverageOnly, type KinchEvent} from "@repo/common/types/kinch-types";
import styles from "./person-scores.module.css";

interface PersonScoresProps {
    wcaId: string;
    age: string;
}

export function PersonScores({wcaId, age}: PersonScoresProps) {
	const {rankings} = useData();
	const kinchRanks = useKinchRanks({age, region: "world"});
	const [sortBy, setSortBy] = useState<"event" | "score">("event");

	const rankIndex = kinchRanks.findIndex(rank => rank.personID === wcaId);

	if (rankIndex < 0) {
		const person = rankings.data.persons[rankings.personIDToIndex[wcaId]];
		if (!person) {
			return <div>WCA ID <b>{wcaId}</b> was not found.</div>;
		}
		return <div><h3>{person.name}</h3><p>No Kinch ranks available for this age group.</p></div>;
	}

	const kinchRank = kinchRanks[rankIndex];
	const ranking = rankIndex + 1;
	const competitorURL = `https://www.worldcubeassociation.org/persons/${wcaId}`;

	const sortedEvents = [...kinchRank.events];
	if (sortBy === "score") {
		sortedEvents.sort((a, b) => b.score - a.score);
	}

	return (
		<div>
			<div className={styles.header}>
				<h3>
					<a className={styles.link} href={competitorURL} target="_blank" rel="noopener noreferrer">
						{kinchRank.personName}
					</a>
				</h3>
				<div>Age Group: {age}</div>
				<div>Region: World</div>
				<div>Rank: {ranking}</div>
				<div>Overall score: {kinchRank.overall.toFixed(2)}</div>
			</div>

			<table className={styles.table}>
				<tbody>
					<tr>
						<th
							className={`${styles.header} ${styles.eventColumn} ${
								sortBy === "event" ? styles.sorted : ""
							}`}
							onClick={() => setSortBy("event")}
						>
							Event
						</th>
						<th
							className={`${styles.header} ${styles.scoreColumn} ${
								sortBy === "score" ? styles.sorted : ""
							}`}
							onClick={() => setSortBy("score")}
						>
							Score
						</th>
						<th className={`${styles.header} ${styles.resultColumn}`}>
							Result
						</th>
					</tr>
					{sortedEvents.map(event => (
						<EventRow
							key={event.eventID}
							event={event}
							age={age}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

interface EventRowProps {
    event: KinchEvent;
    age: string;
}

function EventRow({event, age}: EventRowProps) {
	const {eventName, score, result, type} = event;

	let scoreClass = "";
	if (score >= 100) {
		scoreClass = styles.topScore;
	} else if (score >= 90) {
		scoreClass = styles.highScore;
	} else if (score >= 80) {
		scoreClass = styles.goodScore;
	}

	let resultText: string | JSX.Element = "--";
	if (result) {
		const rankingURL = `https://wca-seniors.org/Senior_Rankings.html#${event.eventID}-${type}-${age}`;
		const resultType = event.eventID !== "333mbf" && !scoreAverageOnly[event.eventID]
			? (type === "single" ? " (sing)" : " (avg)")
			: "";

		resultText = (
			<a className={styles.link} href={rankingURL} target="_blank" rel="noopener noreferrer">
				{result}{resultType}
			</a>
		);
	}

	return (
		<tr className={`${styles.row} ${scoreClass}`}>
			<td className={styles.eventColumn}>{eventName}</td>
			<td className={styles.scoreColumn}>{score.toFixed(2)}</td>
			<td className={styles.resultColumn}>{resultText}</td>
		</tr>
	);
}