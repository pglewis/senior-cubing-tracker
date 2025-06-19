import {useParams, useSearchParams, useNavigate, Link} from "react-router";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import {useProfile, type ProfileData} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {ROUTES} from "@repo/app/routes";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {Combobox, type ComboboxItem} from "@repo/app/components/combobox/combobox";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {RankingLink} from "../components/urls/ranking-link";
import styles from "./profile.module.css";

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

	const handlePersonSelect = (item: ComboboxItem) => {
		navigate(`/profile/${item.value}`);
	};

	const handleAgeChange = (newAge: string) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			params.set("age", newAge);
			return params;
		});
	};

	return (
		<div className={styles.container}>
			<h2>Senior Profiles</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			{/* Always show search */}
			<div className={styles.nameSearch}>
				<Combobox
					items={comboboxItems}
					placeholder="Search by name or WCA ID..."
					onSelect={handlePersonSelect}
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

	// Helper function to build kinch ranking URLs with highlighting
	const buildKinchRankingUrl = (regionType: "world" | "continent" | "country", rank: number) => {
		let region = "world";

		if (regionType === "continent") {
			region = toRegionParam(person.continentId, true);
		} else if (regionType === "country") {
			region = toRegionParam(person.countryId, false);
		}

		// Calculate target page (assuming 25 rows per page like in person-scores-page)
		const rowsPerPage = 25;
		const targetPage = Math.ceil(rank / rowsPerPage);

		return `${ROUTES.KINCH_RANKS}?page=${targetPage}&age=${age}&region=${region}`;
	};

	return (
		<>
			{/* Profile Header */}
			<Card className={styles.profileCard}>
				<div className={styles.profileHeader}>
					<CountryFlag
						countryCode={person.countryId}
						size="large"
						title={rankings?.countries[person.countryId]?.name || person.countryId}
					/>
					<div>
						<h2 className={styles.profileName}>{person.name}</h2>
						<div className={styles.profileDetails}>
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
			<div className={styles.ageTabsContainer}>
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
			<Card className={styles.kinchRankCard}>
				<h3 className={styles.kinchScoresTitle}>{age}+ Kinch Rankings</h3>
				<div className={styles.kinchScoresGrid}>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>World</div>
						<div className={styles.kinchRankValue}>
							<Link
								to={buildKinchRankingUrl("world", kinchScores.worldRank)}
								state={{highlight: person.personId}}
								style={{textDecoration: "none", color: "inherit"}}
							>
								#{kinchScores.worldRank}
							</Link>
						</div>
						<div className={styles.kinchScoreValue}>{kinchScores.world.toFixed(2)}</div>
					</div>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>{rankings?.continents[person.continentId]?.name || person.continentId}</div>
						<div className={styles.kinchRankValue}>
							<Link
								to={buildKinchRankingUrl("continent", kinchScores.continentRank)}
								state={{highlight: person.personId}}
								style={{textDecoration: "none", color: "inherit"}}
							>
								#{kinchScores.continentRank}
							</Link>
						</div>
						<div className={styles.kinchScoreValue}>{kinchScores.continent.toFixed(2)}</div>
					</div>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>{rankings?.countries[person.countryId]?.name || person.countryId}</div>
						<div className={styles.kinchRankValue}>
							<Link
								to={buildKinchRankingUrl("country", kinchScores.countryRank)}
								state={{highlight: person.personId}}
								style={{textDecoration: "none", color: "inherit"}}
							>
								#{kinchScores.countryRank}
							</Link>
						</div>
						<div className={styles.kinchScoreValue}>{kinchScores.country.toFixed(2)}</div>
					</div>
				</div>
			</Card>

			{/* Event Results */}
			{eventResults.length > 0 && (
				<EventResults eventResults={eventResults} person={person} age={age} />
			)}

			{/* Show message if no results for this age category */}
			{eventResults.length === 0 && (
				<Card className={styles.notFoundCard}>
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
		<div className={styles.eventResultsContainer}>
			{eventResults.map((event) => (
				<Card key={event.eventId} className={styles.eventCard}>
					<div className={styles.eventHeader}>
						<div className={styles.eventName}>{event.eventName}</div>
						{event.kinchScores && (
							<div className={styles.eventKinch}>
								<div className={styles.kinchLabel}>Kinch Scores</div>
								<div className={styles.kinchValues}>
									<div className={styles.kinchValue}>
										<div className={styles.kinchValueLabel}>🌍</div>
										<div className={styles.kinchValueScore}>
											{event.kinchScores.world.toFixed(1)}
										</div>
									</div>
									<div className={styles.kinchValue}>
										<div className={styles.kinchValueLabel}>🌎</div>
										<div className={styles.kinchValueScore}>
											{event.kinchScores.continent.toFixed(1)}
										</div>
									</div>
									<div className={styles.kinchValue}>
										<div className={styles.kinchValueLabel}>
											<CountryFlag
												countryCode={person.countryId}
												size="small"
												decorative
											/>
										</div>
										<div className={styles.kinchValueScore}>
											{event.kinchScores.country.toFixed(1)}
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
					<div className={styles.resultsContainer}>
						<div className={`${styles.resultsGrid} ${event.single && event.average ? styles.twoColumn : ""}`}>
							{event.single && (
								<div className={styles.resultItem}>
									<div className={styles.resultType}>Single</div>
									<div className={styles.resultValue}>
										<RankingLink age={age} eventId={event.eventId} eventType="single">
											{event.single.result}
										</RankingLink>
									</div>
									<div className={styles.resultRanks}>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>WR</div>
											<div className={styles.rankValue}>
												<RankingLink age={age} eventId={event.eventId} eventType="single">
													#{event.single.worldRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>CR</div>
											<div className={styles.rankValue}>
												<RankingLink age={age} eventId={event.eventId} eventType="single" region={{type: "continent", id: person.continentId}}>
													#{event.single.continentRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>NR</div>
											<div className={styles.rankValue}>
												<RankingLink age={age} eventId={event.eventId} eventType="single" region={{type: "country", id: person.countryId}}>
													#{event.single.countryRank}
												</RankingLink>
											</div>
										</div>
									</div>
								</div>
							)}
							{event.average && (
								<div className={styles.resultItem}>
									<div className={styles.resultType}>Average</div>
									<div className={styles.resultValue}>
										<RankingLink age={age} eventId={event.eventId} eventType="average">
											{event.average.result}
										</RankingLink>
									</div>
									<div className={styles.resultRanks}>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>WR</div>
											<div className={styles.rankValue}>
												<RankingLink age={age} eventId={event.eventId} eventType="average">
													#{event.average.worldRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>CR</div>
											<div className={styles.rankValue}>
												<RankingLink age={age} eventId={event.eventId} eventType="average" region={{type: "continent", id: person.continentId}}>
													#{event.average.continentRank}
												</RankingLink>
											</div>
										</div>
										<div className={styles.rankItem}>
											<div className={styles.rankLabel}>NR</div>
											<div className={styles.rankValue}>
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
		<Card className={styles.notFoundCard}>
			<div>Person not found</div>
		</Card>
	);
}