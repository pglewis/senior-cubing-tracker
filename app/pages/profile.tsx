import {useParams, useSearchParams, useNavigate} from "react-router";
import {useProfile} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs, type ButtonTabOption} from "@repo/app/components/button-tabs/button-tabs";
import {Combobox, type ComboboxItem} from "@repo/app/components/combobox/combobox";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import styles from "./profile.module.css";

export function Profile() {
	const {wcaid} = useParams<{wcaid?: string;}>();
	const [searchParams, setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const {rankings} = useData();

	const age = searchParams.get("age") || "40";

	const {person, kinchScores, eventResults, availableAges, isLoading, error} = useProfile({
		wcaId: wcaid || "",
		age
	});

	// Prepare combobox items from rankings
	const comboboxItems: ComboboxItem[] = rankings ?
		Object.values(rankings.persons).map(person => ({
			value: person.personId,
			label: person.name
		})) : [];

	// Prepare age tab options
	const ageTabOptions: ButtonTabOption[] = availableAges.map(availableAge => ({
		value: availableAge,
		label: `${availableAge}+`
	}));

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

	// If no wcaid, show search interface
	if (!wcaid) {
		return (
			<div className={styles.container}>
				<h1>Profile</h1>
				<Card className={styles.searchCard}>
					<h2>Find a Person</h2>
					<Combobox
						items={comboboxItems}
						placeholder="Search by name or WCA ID..."
						onSelect={handlePersonSelect}
					/>
				</Card>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className={styles.container}>
				<div>Loading profile...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className={styles.container}>
				<div>Error: {error}</div>
			</div>
		);
	}

	if (!person) {
		return (
			<div className={styles.container}>
				<div>Person not found</div>
			</div>
		);
	}

	const countryName = rankings?.countries[person.countryId]?.name || person.countryId;
	const continentName = rankings?.continents[person.continentId]?.name || person.continentId;

	return (
		<div className={styles.container}>
			{/* Header */}
			<Card className={styles.profileCard}>
				<div className={styles.profileHeader}>
					<CountryFlag
						countryCode={person.countryId}
						size="large"
						title={countryName}
					/>
					<div>
						<h1 className={styles.profileName}>{person.name}</h1>
						<div className={styles.profileDetails}>
							<div>Country: {countryName}</div>
							<div>WCA ID: {person.personId}</div>
						</div>
					</div>
				</div>
			</Card>

			{/* Age Tabs */}
			<div className={styles.ageTabsContainer}>
				<ButtonTabs
					options={ageTabOptions}
					selectedValue={age}
					onChange={handleAgeChange}
				/>
			</div>

			{/* Kinch Scores */}
			<Card>
				<h2 className={styles.kinchScoresTitle}>{age}+ Kinch Scores</h2>
				<div className={styles.kinchScoresGrid}>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>World</div>
						<div className={styles.kinchScoreValue}>{kinchScores.world.toFixed(1)}</div>
					</div>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>{continentName}</div>
						<div className={styles.kinchScoreValue}>{kinchScores.continent.toFixed(1)}</div>
					</div>
					<div className={styles.kinchScoreItem}>
						<div className={styles.kinchScoreLabel}>{countryName}</div>
						<div className={styles.kinchScoreValue}>{kinchScores.country.toFixed(1)}</div>
					</div>
				</div>
			</Card>

			{/* Event Results Table */}
			<Card>
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
			</Card>
		</div>
	);
}