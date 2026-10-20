import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import {RankingLink} from "@repo/app/components/urls/ranking-link";
import {ResultItem} from "@repo/app/components/event-card/event-card";
import {toRegionParam} from "@repo/common/util/region-utils";
import styles from "./profile.module.css";

interface ResultDisplayProps {
	type: "single" | "average";
	result: string;
	date: string;
	worldRank: number;
	continentRank: number;
	countryRank: number;
	age: string;
	eventId: WCAEventId;
	continentId: string;
	countryId: string;
	achievementAge: number;
}

export function ResultDisplay(props: ResultDisplayProps) {
	const {
		type,
		result,
		date,
		worldRank,
		continentRank,
		countryRank,
		age,
		eventId,
		continentId,
		countryId,
		achievementAge,
	} = props;

	return (
		<ResultItem
			type={type}
			result={result}
			date={date}
			eventId={eventId}
			age={age}
			achievementAge={achievementAge}
		>
			<div className={styles["result-ranks"]}>
				<div className={styles["rank-item"]}>
					<div className={styles["rank-label"]}>WR</div>
					<div className={styles["rank-value"]}>
						<RankingLink age={age} eventId={eventId} eventType={type}>
							#{worldRank}
						</RankingLink>
					</div>
				</div>
				<div className={styles["rank-item"]}>
					<div className={styles["rank-label"]}>CR</div>
					<div className={styles["rank-value"]}>
						<RankingLink age={age} eventId={eventId} eventType={type} region={toRegionParam(continentId, true)}>
							#{continentRank}
						</RankingLink>
					</div>
				</div>
				<div className={styles["rank-item"]}>
					<div className={styles["rank-label"]}>NR</div>
					<div className={styles["rank-value"]}>
						<RankingLink age={age} eventId={eventId} eventType={type} region={toRegionParam(countryId, false)}>
							#{countryRank}
						</RankingLink>
					</div>
				</div>
			</div>
		</ResultItem>
	);
}
