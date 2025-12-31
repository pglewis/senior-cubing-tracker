import {useParams, useSearchParams, useNavigate} from "react-router";
import {useProfile} from "@repo/app/features/profile/hooks/use-profile";
import {useData} from "@repo/app/hooks/use-data";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {CompetitorCombobox} from "@repo/app/components/competitor-combobox/competitor-combobox";
import type {ComboboxItem} from "@repo/app/components/combobox/combobox";
import {ProfileContent} from "./profile-content";
import {PersonNotFound} from "./person-not-found";
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
