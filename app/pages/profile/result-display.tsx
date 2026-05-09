import type {WCAEventId} from "@repo/common/types/rankings-snapshot";
import {RankingLink} from "@repo/app/components/urls/ranking-link";
import {Pill} from "@repo/app/components/pill/pill";
import {dateIsRecent} from "@repo/common/util/parse";
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

	const showAchievementAge = achievementAge > parseInt(age);
	const typeLabel = type === "single" ? "Single" : "Average";

	const isRecent = dateIsRecent(date);

	return (
		<div className={styles["result-item"]}>
			<div className={styles["result-info"]}>
				<div className={styles["result-type"]}>{typeLabel}</div>
				<div className={styles["result-value"]}>
					<RankingLink age={age} eventId={eventId} eventType={type}>
						{result}
					</RankingLink>
					{showAchievementAge && <Pill>({achievementAge})</Pill>}
				</div>
				<div className={styles["result-date"]}>
					{date} {isRecent && "🔥"}
				</div>
			</div>
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
						<RankingLink age={age} eventId={eventId} eventType={type} region={{type: "continent", id: continentId}}>
							#{continentRank}
						</RankingLink>
					</div>
				</div>
				<div className={styles["rank-item"]}>
					<div className={styles["rank-label"]}>NR</div>
					<div className={styles["rank-value"]}>
						<RankingLink age={age} eventId={eventId} eventType={type} region={{type: "country", id: countryId}}>
							#{countryRank}
						</RankingLink>
					</div>
				</div>
			</div>
		</div>
	);
}
