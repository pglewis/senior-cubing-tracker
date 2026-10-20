import {useState} from "react";
import {Link} from "react-router";
import clsx from "clsx";
import {type KinchEvent, type KinchRank} from "@repo/common/types/kinch-types";
import {buildProfilePersonRoute} from "@repo/app/routing/routes";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {Card} from "@repo/app/components/card/card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {Pill} from "@repo/app/components/pill/pill";
import {RankingLink} from "@repo/app/components/urls/ranking-link";
import {dateIsRecent} from "@repo/common/util/parse";
import {getResultKey} from "@repo/common/util/achievement-age";
import styles from "./person-scores.module.css";

interface PersonScoresProps {
	// Pre-processed person data
	personKinchRank: KinchRank,
	countryCode: string,
	regionName: string,
	age: string,
	/** Prefixed region parameter (e.g. "world", "CNA" or "NNA") */
	region: string,
	/** Achievement ages keyed by getResultKey */
	achievementAges: Map<string, number>,
	returnPath: string,
	getShowInRankingsUrl: (targetPage: number) => string,
	rowsPerPage: number,
};

type SortColumn = "event" | "score";

export function PersonScores(props: PersonScoresProps) {
	const {
		personKinchRank,
		countryCode,
		regionName,
		age,
		region,
		achievementAges,
		returnPath,
		getShowInRankingsUrl,
		rowsPerPage,
	} = props;
	const currentAge = parseInt(age);
	const [sortBy, setSortBy] = useState<SortColumn>("event");

	// Default: sort by WCA event sort order (kinchRank events are already in this order)
	const sortedEvents = [...personKinchRank.events];
	if (sortBy === "score") {
		sortedEvents.sort((a, b) => b.score - a.score);
	}

	const kinchRanking = personKinchRank.displayRank ?? 0;
	const targetPage = Math.ceil(kinchRanking / rowsPerPage);
	const competitorURL = `${buildProfilePersonRoute(personKinchRank.personId)}?age=${age}`;

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
					Overall score: {personKinchRank.overall.toFixed(3)}
				</div>
			</Card>

			<div className={styles["sort-controls"]}>
				<span className={styles["sort-label"]}>Sort:</span>
				<ButtonTabs
					selectedValue={sortBy}
					onChange={(value) => setSortBy(value as SortColumn)}
					options={[
						{value: "event", label: "Event"},
						{value: "score", label: "Score"},
					]}
				/>
			</div>

			<div
				className={styles["event-list"]}
				aria-label={`Event scores for ${personKinchRank.personName}`}
			>
				{sortedEvents.map(event => {
					const achievementAge = getEventAchievementAge(event, achievementAges);
					return (
						<EventScoreCard
							key={event.eventId}
							event={event}
							age={age}
							region={region}
							achievementAge={achievementAge !== undefined && achievementAge > currentAge ? achievementAge : undefined}
						/>
					);
				})}
			</div>
		</div>
	);
}

function getEventAchievementAge(event: KinchEvent, achievementAges: Map<string, number>): number | undefined {
	const {eventId, type, result, date} = event;
	if (!type || !result || !date) {
		return undefined;
	}
	return achievementAges.get(getResultKey({eventId, type, result, date}));
}

interface EventScoreCardProps {
	event: KinchEvent;
	age: string;
	region: string;
	achievementAge: number | undefined;
}

function EventScoreCard({event, age, region, achievementAge}: EventScoreCardProps) {
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

	return (
		<div className={clsx(styles["event-card"], scoreClass)}>
			<div className={styles["event-card-header"]}>
				<div className={styles["event-name"]}>
					{eventName} {event.eventId !== "333mbf" && (type === "single" ? "single" : "average")}
				</div>
				<div className={styles["event-score"]}>{scoreDisplay}</div>
			</div>
			<div className={styles["event-card-result"]}>
				<span className={styles["result-value"]}>
					{type && (
						<RankingLink className={styles.link} eventId={event.eventId} eventType={type} age={age} region={region}>
							{result}
						</RankingLink>
					)}
				</span>
				<span>
					{achievementAge !== undefined && <Pill>({achievementAge})</Pill>}
				</span>
				<span className={styles["result-date"]}>
					{date}
				</span>
				<span>
					{isRecent && " 🔥"}
				</span>
			</div>
		</div>
	);
}
