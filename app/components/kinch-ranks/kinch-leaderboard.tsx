interface KinchLeaderboardProps {
	age: string;
	region: string;
}

export function KinchLeaderboard({age, region}: KinchLeaderboardProps) {
	return (
		<div>
			<h3>Leaderboard</h3>
			<p>Age: {age}</p>
			<p>Region: {region}</p>
			<p>TODO: Display leaderboard table here</p>
		</div>
	);
}