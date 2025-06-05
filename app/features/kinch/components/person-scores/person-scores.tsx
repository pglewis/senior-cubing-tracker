import {useState, type JSX} from "react";
import {Link, useLocation} from "react-router-dom";
import clsx from "clsx";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {scoreAverageOnly, type KinchEvent} from "@repo/common/types/kinch-types";
import {Card} from "@repo/app/components/card/card";
import styles from "./person-scores.module.css";
import type {RegionInfo} from "@repo/app/features/kinch/context/kinch-context-types";

const ROWS_PER_PAGE = 25; // Match the leaderboard constant

interface PersonScoresProps {
	wcaId: string,
	age: string,
	region: string, // Prefixed with continent/country prefix
	regionInfo: RegionInfo,
}

export function PersonScores({wcaId, age, region, regionInfo}: PersonScoresProps) {
	const {rankings} = useData();
	const kinchRanks = useKinchRanks({age, region});
	const {state} = useLocation();
	const returnPath = state?.from || "/kinch-ranks";

	const [sortBy, setSortBy] = useState<"event" | "score">("event");

	const rankIndex = kinchRanks.findIndex(kr => kr.personId === wcaId);
	if (rankIndex < 0) {
		// This could be because the person has no kinch ranks data ()
		const person = rankings.data.persons[rankings.personIdToIndex[wcaId]];
		if (!person) {
			return <div>WCA ID <b>{wcaId}</b> was not found.</div>;
		}
		return <div><h3>{person.name}</h3><p>No Kinch ranks available for this age group.</p></div>;
	}

	const kinchRank = kinchRanks[rankIndex];
	const ranking = rankIndex + 1;
	const targetPage = Math.ceil(ranking / ROWS_PER_PAGE);
	const competitorURL = `https://www.worldcubeassociation.org/persons/${wcaId}`;

	// Default: sort by WCA event sort order (kinchRank events are already in this order)
	const sortedEvents = [...kinchRank.events];
	if (sortBy === "score") {
		sortedEvents.sort((a, b) => b.score - a.score);
	}

	// Extract the display name for the selected region ("World", "Europe", "Italy")
	let regionName: string;
	if (regionInfo.type === "world") {
		regionName = "World";
	} else if (regionInfo.type === "continent") {
		regionName = rankings.data.continents[rankings.continentIdToIndex[regionInfo.id]].name;
	} else {
		regionName = rankings.data.countries[rankings.countryIdToIndex[regionInfo.id]].name;
	}

	return (
		<div className={styles.personScores}>
			<Card>
				<h3 className={styles.personName}>
					<a className={styles.link} href={competitorURL} target="_blank">
						{kinchRank.personName}
					</a>
				</h3>
				<div>
					{regionName}, {age}+
				</div>
				<div>
					Rank: #{ranking} (<ShowInRankingsListLink targetPage={targetPage} wcaId={wcaId} age={age} region={region} />)
				</div>
				<div>
					Overall score: {kinchRank.overall.toFixed(2)}
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
							regionInfo={regionInfo}
							age={age}
						/>
					))}
				</tbody>
			</table>
		</div>
	);
}

interface ShowInRankingsListLinkProps {
	targetPage: number,
	age: string,
	region: string,
	wcaId: string,
};

function ShowInRankingsListLink({targetPage, age, region, wcaId}: ShowInRankingsListLinkProps) {
	return (
		<Link
			to={`/kinch-ranks?page=${targetPage}&age=${age}&region=${region}`}
			state={{highlight: wcaId}}
			className={styles.link}
		>
			Show in rankings list
		</Link>
	);
}

interface EventRowProps {
	event: KinchEvent,
	age: string,
	regionInfo: RegionInfo,
};

function EventRow({event, age, regionInfo}: EventRowProps) {
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

	let resultText: string | JSX.Element = "--";
	if (result) {
		// Build the URL to the correct event/type/age/region listing
		const baseRankingURL = "https://wca-seniors.org/Senior_Rankings.html";
		let regionParam = "";
		if (regionInfo.type === "continent") {
			regionParam = "-" + regionInfo.id.toLowerCase();
		} else if (regionInfo.type === "country") {
			regionParam = "-xx-" + regionInfo.id.toLowerCase();
		}
		const rankingURL = `${baseRankingURL}#${event.eventId}-${type}-${age}${regionParam}`;

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