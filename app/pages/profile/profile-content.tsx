import {Link} from "react-router";
import type {ProfileData} from "@repo/app/features/profile/hooks/use-profile";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import {buildKinchPersonRoute} from "@repo/app/routing/routes";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {EventResults} from "./event-results";
import styles from "./profile.module.css";

interface ProfileContentProps {
	person: NonNullable<ProfileData["person"]>;
	age: string;
	availableAges: string[];
	kinchScores: ProfileData["kinchScores"];
	eventResults: ProfileData["eventResults"];
	rankings: EnhancedRankingsData;
	onAgeChange: (age: string) => void;
}

export function ProfileContent(props: ProfileContentProps) {
	const {
		person,
		age,
		availableAges,
		kinchScores,
		eventResults,
		rankings,
		onAgeChange
	} = props;

	const wcaProfileUrl = `https://www.worldcubeassociation.org/persons/${person.personId}`;

	return (
		<>
			{/* Profile Header */}
			<Card className={styles["profile-card"]}>
				<div className={styles["profile-header"]}>
					<CountryFlag
						countryCode={person.countryId}
						size="large"
						title={rankings?.countries[person.countryId]?.name || person.countryId}
					/>
					<div>
						<h2 className={styles["profile-name"]}>{person.name}</h2>
						<div className={styles["profile-details"]}>
							<div>Country: {rankings?.countries[person.countryId]?.name || person.countryId}</div>
							<div>
								WCA ID: {" "}
								<a href={wcaProfileUrl} target="_blank" rel="noopener noreferrer">
									{person.personId}
								</a>
							</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Age Tabs */}
			<div className={styles["age-tabs-container"]}>
				<ButtonTabs
					options={availableAges.map(availableAge => ({
						value: availableAge,
						label: `${availableAge}+`
					}))}
					selectedValue={age}
					onChange={onAgeChange}
				/>
			</div>

			{/* Kinch Rankings */}
			<Card className={styles["kinch-rank-card"]}>
				<h3 className={styles["kinch-scores-title"]}>{age}+ Kinch Rankings</h3>
				<div className={styles["kinch-scores-grid"]}>
					<div className={styles["kinch-score-item"]}>
						<div className={styles["kinch-score-label"]}>World</div>
						<div className={styles["kinch-rank-value"]}>
							<Link
								to={buildKinchPersonRoute(person.personId) + `?age=${age}`}
								state={{highlight: person.personId}}
							>
								#{kinchScores.worldRank}
							</Link>
						</div>
						<div className={styles["kinch-score-value"]}>{kinchScores.world.toFixed(2)}</div>
					</div>
					<div className={styles["kinch-score-item"]}>
						<div className={styles["kinch-score-label"]}>{rankings?.continents[person.continentId]?.name || person.continentId}</div>
						<div className={styles["kinch-rank-value"]}>
							<Link
								to={buildKinchPersonRoute(person.personId) + `?age=${age}&region=${toRegionParam(person.continentId, true)}`}
								state={{highlight: person.personId}}
							>
								#{kinchScores.continentRank}
							</Link>
						</div>
						<div className={styles["kinch-score-value"]}>{kinchScores.continent.toFixed(2)}</div>
					</div>
					<div className={styles["kinch-score-item"]}>
						<div className={styles["kinch-score-label"]}>{rankings?.countries[person.countryId]?.name || person.countryId}</div>
						<div className={styles["kinch-rank-value"]}>
							<Link
								to={buildKinchPersonRoute(person.personId) + `?age=${age}&region=${toRegionParam(person.countryId, false)}`}
								state={{highlight: person.personId}}
							>
								#{kinchScores.countryRank}
							</Link>
						</div>
						<div className={styles["kinch-score-value"]}>{kinchScores.country.toFixed(2)}</div>
					</div>
				</div>
			</Card>

			{/* Event Results */}
			{eventResults.length > 0 && (
				<EventResults eventResults={eventResults} person={person} age={age} />
			)}

			{/* Show message if no results for this age category */}
			{eventResults.length === 0 && (
				<Card className={styles["not-found-card"]}>
					<div>No results found for {age}+ age category</div>
				</Card>
			)}
		</>
	);
}
