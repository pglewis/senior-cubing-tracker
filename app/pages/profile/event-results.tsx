import clsx from "clsx";
import type {ProfileData} from "@repo/app/features/profile/hooks/use-profile";
import {Card} from "@repo/app/components/card/card";
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
		<div className={styles["event-results-container"]}>
			{eventResults.map((event) => (
				<Card key={event.eventId} className={styles["event-card"]}>
					<div className={styles["event-header"]}>
						<div className={styles["event-name"]}><span className={`cubing-icon event-${event.eventId}`}></span>{event.eventName} ({age}+)</div>
						{event.kinchScores && (
							<div className={styles["event-kinch"]}>
								<div className={styles["kinch-label"]}>Kinch Scores</div>
								<div className={styles["kinch-values"]}>
									<div className={styles["kinch-value"]}>
										<div className={styles["kinch-value-label"]}>🌍</div>
										<div className={styles["kinch-value-score"]}>
											{event.kinchScores.world.toFixed(1)}
										</div>
									</div>
									<div className={styles["kinch-value"]}>
										<div className={styles["kinch-value-label"]}>🌎</div>
										<div className={styles["kinch-value-score"]}>
											{event.kinchScores.continent.toFixed(1)}
										</div>
									</div>
									<div className={styles["kinch-value"]}>
										<div className={styles["kinch-value-label"]}>
											<CountryFlag
												countryCode={person.countryId}
												size="small"
												decorative
											/>
										</div>
										<div className={styles["kinch-value-score"]}>
											{event.kinchScores.country.toFixed(1)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					<div className={styles["results-container"]}>
						<div className={clsx(styles["results-grid"], event.single && event.average && styles["two-column"])}>
							{event.single && (
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
								/>
							)}
							{event.average && (
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
								/>
							)}
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}
