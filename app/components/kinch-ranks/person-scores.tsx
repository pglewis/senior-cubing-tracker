interface PersonScoresProps {
	wcaId: string;
	age: string;
}

export function PersonScores({wcaId, age}: PersonScoresProps) {
	return (
		<div>
			<h3>Person Scores</h3>
			<p>WCA ID: {wcaId}</p>
			<p>Age: {age}</p>
			<p>TODO: Display event scores here</p>
		</div>
	);
}