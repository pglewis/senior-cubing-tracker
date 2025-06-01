import {useState, type JSX} from "react";
import {Link, useLocation} from "react-router-dom";
import type {Continent, Country} from "@repo/common/types/rankings-snapshot";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {scoreAverageOnly, type KinchEvent} from "@repo/common/types/kinch-types";
import {Tabs} from "@repo/app/components/shared/tabs";
import {Card} from "@repo/app/components/shared/card";
import styles from "./person-scores.module.css";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";

const ROWS_PER_PAGE = 25; // Match the leaderboard constant

interface PersonScoresProps {
	wcaId: string,
	age: string,
	region: string, // Prefixed with continent/country prefix
	regionName: string,
	onAgeChange: (value: string) => void,
}

export function PersonScores({wcaId, age, region, regionName, onAgeChange}: PersonScoresProps) {
	const {rankings} = useData();
	const kinchRanks = useKinchRanks({age, region});
	const {regionInfo} = useKinchContext();

	const [sortBy, setSortBy] = useState<"event" | "score">("event");

	const rankIndex = kinchRanks.findIndex(kr => kr.personID === wcaId);
	if (rankIndex < 0) {
		// This could be because the person has no kinch ranks data ()
		const person = rankings.data.persons[rankings.personIDToIndex[wcaId]];
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

	//--!! 	Hardcoded
	const ageOptions = [
		{label: "40+", value: "40"},
		{label: "50+", value: "50"},
		{label: "60+", value: "60"}
	];

	return (
		<>
			<PersonHeader
				continents={regionInfo.continents}
				countries={regionInfo.countries}
				personName={kinchRank.personName}
				profileLink={competitorURL}
			/>
			<Tabs options={ageOptions} selectedValue={age} onValueChange={onAgeChange}>
				<div className={styles.tableHeader}>
					<div>
						Region: {regionName}
					</div>
					<div>
						Rank: #{ranking} (<ShowInRankingsListLink targetPage={targetPage} wcaId={wcaId} age={age} region={region} />)
					</div>
					<div>
						Overall score: {kinchRank.overall.toFixed(2)}
					</div>
				</div>
				<table className={styles.table}>
					<tbody>
						<tr>
							<th
								className={`${styles.tableHeader} ${styles.eventColumn} ${sortBy === "event" ? styles.sortedAsc : ""}`}
								onClick={() => setSortBy("event")}
							>
								Event
							</th>
							<th
								className={`${styles.tableHeader} ${styles.scoreColumn} ${sortBy === "score" ? styles.sortedDesc : ""}`}
								onClick={() => setSortBy("score")}
							>
								Score
							</th>
							<th className={`${styles.tableHeader} ${styles.resultColumn}`}>
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
			</Tabs>
		</>
	);
}

interface PersonHeaderProps {
	continents: Continent[],
	countries: Country[],
	personName: string,
	profileLink: string,
}

function PersonHeader({continents, countries, personName, profileLink}: PersonHeaderProps) {
	const {region, setParams} = useKinchContext();
	const {state} = useLocation();
	const returnPath = state?.from || "/kinch-ranks";

	return (
		<Card>
			<h3>
				<a className={styles.link} href={profileLink}>
					{personName}
				</a>
			</h3>
			<RegionFilter
				value={region}
				onChange={(value) => setParams({region: value, page: 1})}
				continents={continents}
				countries={countries}
			/>
			<Link to={returnPath}>
				← Return to previous view
			</Link>
		</Card>
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