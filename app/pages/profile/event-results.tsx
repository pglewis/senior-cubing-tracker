import type {ProfileData} from "@repo/app/features/profile/hooks/use-profile";
import {EventCard, EventCardList} from "@repo/app/components/event-card/event-card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {ResultDisplay} from "./result-display";
import styles from "./profile.module.css";

interface EventResultsProps {
	eventResults: ProfileData["eventResults"];
	person: NonNullable<ProfileData["person"]>;
	age: string;
}

export function EventResults({person, age, eventResults}: EventResultsProps) {
	return (
		<EventCardList>
			{eventResults.map((event) => (
				<EventCard
					key={event.eventId}
					eventId={event.eventId}
					title={`${event.eventName} (${age}+)`}
					headerExtra={event.kinchScores && (
						<KinchScores kinchScores={event.kinchScores} countryId={person.countryId} />
					)}
					single={event.single && (
						<ResultDisplay
							type="single"
							result={event.single.result}
							date={event.single.date}
							worldRank={event.single.worldRank}
							continentRank={event.single.continentRank}
							countryRank={event.single.countryRank}
							age={age}
							eventId={event.eventId}
							continentId={person.continentId}
							countryId={person.countryId}
							achievementAge={event.single.achievementAge}
						/>
					)}
					average={event.average && (
						<ResultDisplay
							type="average"
							result={event.average.result}
							date={event.average.date}
							worldRank={event.average.worldRank}
							continentRank={event.average.continentRank}
							countryRank={event.average.countryRank}
							age={age}
							eventId={event.eventId}
							continentId={person.continentId}
							countryId={person.countryId}
							achievementAge={event.average.achievementAge}
						/>
					)}
				/>
			))}
		</EventCardList>
	);
}

interface KinchScoresProps {
	kinchScores: NonNullable<ProfileData["eventResults"][number]["kinchScores"]>;
	countryId: string;
}

function KinchScores({kinchScores, countryId}: KinchScoresProps) {
	return (
		<div className={styles["event-kinch"]}>
			<div className={styles["kinch-label"]}>Kinch Scores</div>
			<div className={styles["kinch-values"]}>
				<div className={styles["kinch-value"]}>
					<div className={styles["kinch-value-label"]}>🌍</div>
					<div className={styles["kinch-value-score"]}>
						{kinchScores.world.toFixed(1)}
					</div>
				</div>
				<div className={styles["kinch-value"]}>
					<div className={styles["kinch-value-label"]}>🌎</div>
					<div className={styles["kinch-value-score"]}>
						{kinchScores.continent.toFixed(1)}
					</div>
				</div>
				<div className={styles["kinch-value"]}>
					<div className={styles["kinch-value-label"]}>
						<CountryFlag
							countryCode={countryId}
							size="small"
							decorative
						/>
					</div>
					<div className={styles["kinch-value-score"]}>
						{kinchScores.country.toFixed(1)}
					</div>
				</div>
			</div>
		</div>
	);
}
