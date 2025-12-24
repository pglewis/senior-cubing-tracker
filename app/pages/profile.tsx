import {useParams, useSearchParams, useNavigate, Link} from "react-router";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import {useProfile, type ProfileData} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {buildKinchPersonRoute} from "@repo/app/routes";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {CompetitorCombobox} from "@repo/app/components/competitor-combobox/competitor-combobox";
import type {ComboboxItem} from "@repo/app/components/combobox/combobox";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {RankingLink} from "../components/urls/ranking-link";
import styles from "./profile.module.css";
//import {daysAgo} from "@repo/common/util/parse";

export function Profile() {
	const {wcaid} = useParams<{wcaid?: string;}>();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const {rankings} = useData();

	// Get available ages to determine the default
	const {availableAges} = useProfile({
		wcaId: wcaid || "",
		age: "40" // temporary value for initial call
	});

	// Use the oldest available age as default, or "40" as fallback
	const defaultAge = availableAges.length > 0 ? availableAges[availableAges.length - 1] : "40";
	const age = searchParams.get("age") || defaultAge;

	const {person, kinchScores, eventResults} = useProfile({
		wcaId: wcaid || "",
		age
	});

	// Prepare combobox items from rankings
	const comboboxItems: ComboboxItem[] = rankings ?
		Object.values(rankings.persons).map(person => ({
			value: person.personId,
			label: person.name
		})) : [];

	const handleCompetitorSelect = (item: ComboboxItem) => {
		navigate(`/profile/${item.value}`);
	};

	const handleAgeChange = (newAge: string) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			params.set("age", newAge);
			return params;
		}, {preventScrollReset: true});
	};

	return (
		<div className={styles.container}>
			<h2>Senior Profiles</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			{/* Always show search */}
			<div className={styles["name-search"]}>
				<CompetitorCombobox
					items={comboboxItems}
					onSelect={handleCompetitorSelect}
				/>
			</div>

			{/* Show profile content only if we have a valid wcaid and person */}
			{wcaid && person && (
				<ProfileContent
					person={person}
					age={age}
					availableAges={availableAges}
					kinchScores={kinchScores}
					eventResults={eventResults}
					rankings={rankings}
					onAgeChange={handleAgeChange}
				/>
			)}

			{/* Show message if wcaid provided but person not found */}
			{wcaid && !person && <PersonNotFound />}
		</div>
	);
}

type ProfileContentProps = {
	person: NonNullable<ProfileData["person"]>;
	age: string;
	availableAges: string[];
	kinchScores: ProfileData["kinchScores"];
	eventResults: ProfileData["eventResults"];
	rankings: EnhancedRankingsData;
	onAgeChange: (age: string) => void;
};

function ProfileContent(props: ProfileContentProps) {
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

export interface EventResultsProps {
	eventResults: ProfileData["eventResults"];
	person: NonNullable<ProfileData["person"]>;
	age: string;
};

function EventResults({person, age, eventResults}: EventResultsProps) {
	return (
		// Event Kinch scores
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
					{/* Event results */}
					<div className={styles["results-container"]}>
						<div className={`${styles["results-grid"]} ${event.single && event.average ? styles["two-column"] : ""}`}>
							{/* Single */}
							{event.single && (
								<div className={styles["result-item"]}>
									<div className={styles["result-type"]}>Single</div>
									<div className={styles["result-value"]}>
										<RankingLink age={age} eventId={event.eventId} eventType="single">
											{event.single.result}
										</RankingLink>
									</div>
									<div className={styles["result-ranks"]}>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>WR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="single">
													#{event.single.worldRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>CR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="single" region={{type: "continent", id: person.continentId}}>
													#{event.single.continentRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>NR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="single" region={{type: "country", id: person.countryId}}>
													#{event.single.countryRank}
												</RankingLink>
											</div>
										</div>
									</div>
								</div>
							)}
							{/* Average */}
							{event.average && (
								<div className={styles["result-item"]}>
									<div className={styles["result-type"]}>Average</div>
									<div className={styles["result-value"]}>
										<RankingLink age={age} eventId={event.eventId} eventType="average">
											{event.average.result}
										</RankingLink>
									</div>
									<div className={styles["result-ranks"]}>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>WR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="average">
													#{event.average.worldRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>CR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="average" region={{type: "continent", id: person.continentId}}>
													#{event.average.continentRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles["rank-item"]}>
											<div className={styles["rank-label"]}>NR</div>
											<div className={styles["rank-value"]}>
												<RankingLink age={age} eventId={event.eventId} eventType="average" region={{type: "country", id: person.countryId}}>
													#{event.average.countryRank}
												</RankingLink>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				</Card>
			))}
		</div>
	);
}

function PersonNotFound() {
	return (
		<Card className={styles["not-found-card"]}>
			<div>Person not found</div>
		</Card>
	);
}