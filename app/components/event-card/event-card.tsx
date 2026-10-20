import clsx from "clsx";
import {Link} from "react-router";
import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {EventRecord, EventRecords} from "@repo/common/types/event-records";
import {RankingLink} from "@repo/app/components/urls/ranking-link";
import {Card} from "@repo/app/components/card/card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {Pill} from "@repo/app/components/pill/pill";
import {dateIsRecent} from "@repo/common/util/parse";
import styles from "./event-card.module.css";

/** Vertical list of event cards */
export function EventCardList({children}: {children: React.ReactNode}) {
	return <div className={styles["event-card-list"]}>{children}</div>;
}

interface EventCardProps {
	eventId: WCAEventId;
	title: string;
	/** Optional content on the right side of the header */
	headerExtra?: React.ReactNode;
	single?: React.ReactNode;
	average?: React.ReactNode;
}

export function EventCard({eventId, title, headerExtra, single, average}: EventCardProps) {
	return (
		<Card className={styles["event-card"]}>
			<div className={styles["event-header"]}>
				<div className={styles["event-name"]}>
					<span className={clsx("cubing-icon", `event-${eventId}`, styles["event-icon"])}></span>
					{title}
				</div>
				{headerExtra}
			</div>
			<div className={styles["event-result"]}>
				<div className={clsx(styles["result-grid"], single && average && styles["two-column"])}>
					{single && <div className={styles["result-col"]}>{single}</div>}
					{average && <div className={styles["result-col"]}>{average}</div>}
				</div>
			</div>
		</Card>
	);
}

interface ResultItemProps {
	type: "single" | "average";
	result: string;
	date: string;
	eventId: WCAEventId;
	/** Selected age category */
	age: string;
	/** Age category the result was achieved in, shown when older than the selected age */
	achievementAge: number;
	/** Prefixed region parameter for the rankings link (e.g. "world", "CNA" or "NNA") */
	region?: string;
	/** Optional content below the date */
	children?: React.ReactNode;
}

export function ResultItem(props: ResultItemProps) {
	const {type, result, date, eventId, age, achievementAge, region, children} = props;
	const showAchievementAge = achievementAge > parseInt(age);

	return (
		<div className={styles["result-item"]}>
			<div className={styles["result-type"]}>{type === "single" ? "Single" : "Average"}</div>
			<div className={styles["result-value"]}>
				<RankingLink age={age} eventId={eventId} eventType={type} region={region}>
					{result}
				</RankingLink>
				{showAchievementAge && <Pill>({achievementAge})</Pill>}
			</div>
			<div className={styles["result-date"]}>
				{date} {dateIsRecent(date) && "🔥"}
			</div>
			{children}
		</div>
	);
}

interface RecordCardProps {
	event: EventRecords;
	title: string;
	/** Selected age category */
	age: string;
	/** Prefixed region parameter (e.g. "world", "CNA" or "NNA") */
	region: string;
	getPersonUrl: (personId: string) => string;
}

/** An event's single and average records, with every holder of each */
export function RecordCard({event, title, age, region, getPersonUrl}: RecordCardProps) {
	const recordResults = (type: ResultItemProps["type"], record: EventRecord | undefined) => record && (
		<RecordResults
			type={type}
			eventId={event.eventId}
			record={record}
			age={age}
			region={region}
			getPersonUrl={getPersonUrl}
		/>
	);

	return (
		<EventCard
			eventId={event.eventId}
			title={title}
			single={recordResults("single", event.single)}
			average={recordResults("average", event.average)}
		/>
	);
}

interface RecordResultsProps extends Omit<RecordCardProps, "event" | "title"> {
	type: ResultItemProps["type"];
	eventId: WCAEventId;
	record: EventRecord;
}

function RecordResults({type, eventId, record, age, region, getPersonUrl}: RecordResultsProps) {
	return (
		<>
			{record.holders.map(holder => (
				<ResultItem
					key={holder.personId}
					type={type}
					result={record.result}
					date={holder.date}
					eventId={eventId}
					age={age}
					achievementAge={holder.achievementAge}
					region={region}
				>
					<div className={styles["result-holder"]}>
						<CountryFlag
							countryCode={holder.countryId}
							size="small"
							decorative
						/>
						{" "}
						<Link to={getPersonUrl(holder.personId)} className={styles["holder-link"]}>
							{holder.personName}
						</Link>
					</div>
				</ResultItem>
			))}
		</>
	);
}
