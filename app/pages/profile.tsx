import {useParams, useSearchParams} from "react-router";
import {useProfile} from "@repo/app/features/profile/hooks/use-profile";

export function Profile() {
	const {wcaid} = useParams<{wcaid: string;}>();
	const [searchParams] = useSearchParams();
	const age = searchParams.get("age") || "40";

	const {person, kinchScores, availableAges, isLoading, error} = useProfile({
		wcaId: wcaid || "",
		age
	});

	if (isLoading) {
		return <div>Loading profile...</div>;
	}

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (!person) {
		return <div>Person not found</div>;
	}

	return (
		<div>
			<h1>Profile: {person.name}</h1>
			<p>WCA ID: {wcaid}</p>
			<p>Country: {person.countryId}</p>
			<p>Age Category: {age}+</p>

			<h2>Available Age Categories:</h2>
			<p>{availableAges.join(", ")}</p>

			<h2>Kinch Scores:</h2>
			<ul>
				<li>World: {kinchScores.world.toFixed(1)}</li>
				<li>Continent: {kinchScores.continent.toFixed(1)}</li>
				<li>Country: {kinchScores.country.toFixed(1)}</li>
			</ul>
		</div>
	);
}