import {useParams, useSearchParams, useNavigate} from "react-router";
import {useProfile} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {Combobox, type ComboboxItem} from "@repo/app/components/combobox/combobox";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import styles from "./profile.module.css";
import {DataLastUpdated} from "../components/data-last-updated/data-last-updated";

export function Profile() {
	const {wcaid} = useParams<{wcaid?: string;}>();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const {rankings} = useData();

	const age = searchParams.get("age") || "40";

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

	const {person, kinchScores, eventResults, availableAges} = useProfile({
		wcaId: wcaid || "",
		age
	});

	return (
		<div className={styles.container}>
			<h2>Senior Profiles</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			{/* name/WCA ID search */}
			<div className={styles.nameSearch}>
				<Combobox
					items={comboboxItems}
					placeholder="Search by name or WCA ID..."
					onSelect={handlePersonSelect}
				/>
			</div>

			{/* Show profile content only if we have a valid wcaid and person */}
			{wcaid && person && (
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
									<div>WCA ID: {person.personId}</div>
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
							onChange={handleAgeChange}
						/>
					</div>

					{/* Kinch Rankings */}
					<Card className={styles.kinchRankCard}>
						<h3 className={styles.kinchScoresTitle}>{age}+ Kinch Rankings</h3>
						<div className={styles.kinchScoresGrid}>
							<div className={styles.kinchScoreItem}>
								<div className={styles.kinchScoreLabel}>World</div>
								<div className={styles.kinchRankValue}>#{kinchScores.worldRank}</div>
								<div className={styles.kinchScoreValue}>{kinchScores.world.toFixed(2)}</div>
							</div>
							<div className={styles.kinchScoreItem}>
								<div className={styles.kinchScoreLabel}>{rankings?.continents[person.continentId]?.name || person.continentId}</div>
								<div className={styles.kinchRankValue}>#{kinchScores.continentRank}</div>
								<div className={styles.kinchScoreValue}>{kinchScores.continent.toFixed(2)}</div>
							</div>
							<div className={styles.kinchScoreItem}>
								<div className={styles.kinchScoreLabel}>{rankings?.countries[person.countryId]?.name || person.countryId}</div>
								<div className={styles.kinchRankValue}>#{kinchScores.countryRank}</div>
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
			)}

			{/* Show message if wcaid provided but person not found */}
			{wcaid && !person && (
				<div>Person not found</div>
			)}
		</div>
	);
}