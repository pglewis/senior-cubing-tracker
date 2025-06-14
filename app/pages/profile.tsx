import {useParams, useSearchParams, useNavigate, Link} from "react-router";
import {useProfile} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {ROUTES} from "@repo/app/routes";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {Combobox, type ComboboxItem} from "@repo/app/components/combobox/combobox";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
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
	person: NonNullable<ReturnType<typeof useProfile>["person"]>;
	age: string;
	availableAges: string[];
	kinchScores: NonNullable<ReturnType<typeof useProfile>["kinchScores"]>;
	eventResults: ReturnType<typeof useProfile>["eventResults"];
	rankings: NonNullable<ReturnType<typeof useData>["rankings"]>;
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

			{/* Event Results Table */}
			<table className={styles.table}>
				<thead className={styles.tableHeader}>
					<tr>
						<th className={styles.tableHeaderCell}>Event</th>
						<th className={styles.tableHeaderCell}>Result</th>
						<th className={styles.tableHeaderCell}>WR</th>
						<th className={styles.tableHeaderCell}>CR</th>
						<th className={styles.tableHeaderCell}>NR</th>
						<th className={styles.tableHeaderCell}>WK</th>
						<th className={styles.tableHeaderCell}>CK</th>
						<th className={styles.tableHeaderCell}>NK</th>
					</tr>
				</thead>
				<tbody>
					{eventResults.map((event) => (
						<tr key={event.eventId} className={styles.tableRow}>
							<td className={styles.tableCell}>
								<div className={styles.eventName}>{event.eventName}</div>
								<div className={styles.eventType}>
									({event.type || "single"})
								</div>
							</td>
							<td className={`${styles.tableCell} ${styles.resultValue}`}>
								{event.result}
							</td>
							<td className={styles.tableCell}>--</td>
							<td className={styles.tableCell}>--</td>
							<td className={styles.tableCell}>--</td>
							<td className={styles.tableCell}>--</td>
							<td className={styles.tableCell}>--</td>
							<td className={styles.tableCell}>--</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	);
}

function PersonNotFound() {
	return (
		<Card className={styles.notFoundCard}>
			<div>Person not found</div>
		</Card>
	);
}