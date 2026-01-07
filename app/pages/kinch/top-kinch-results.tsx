import {useMemo} from "react";
import {Link} from "react-router";
import clsx from "clsx";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useTopKinchResults} from "@repo/app/features/kinch/hooks/use-top-kinch-results";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {Card} from "@repo/app/components/card/card";
import {CountryFlag} from "@repo/app/components/flags/country-flag";
import {buildKinchPersonRoute} from "@repo/app/routing/routes";
import {dateIsRecent} from "@repo/common/util/parse";
import styles from "./top-kinch-results.module.css";

export function TopKinchResults() {
	const {rankings, topRanks} = useData();
	const {age, region, regionInfo} = useKinchContext();
	const results = useTopKinchResults({age, region});

	// Calculate available age options for the current region
	const ageOptions = useMemo(() => {
		if (!topRanks) return [];

		return Array.from(new Set(topRanks
			.filter(tr => tr.region === region)
			.map(tr => tr.age)
		))
			.sort((a, b) => a - b)
			.map(age => ({value: age.toString(), label: `${age}+`}));
	}, [topRanks, region]);

	const getRegionName = () => {
		if (regionInfo.type === "world") return "World";
		if (regionInfo.type === "continent") {
			return rankings?.continents[regionInfo.id]?.name || regionInfo.id;
		}
		return rankings?.countries[regionInfo.id]?.name || regionInfo.id;
	};

	if (results.length === 0) {
		return (
			<KinchLayout availableAgeOptions={ageOptions}>
				<div>
					<h3>Top Kinch Results</h3>
					<p>No results found for the selected age and region.</p>
				</div>
			</KinchLayout>
		);
	}

	const regionName = getRegionName();

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			<Card className={styles["header-card"]}>
				<h3 className={styles["header-title"]}>Top Kinch Results</h3>
				<div className={styles["header-subtitle"]}>
					{regionName}, {age}+
				</div>
				<p className={styles.description}>
					These are the best results for each event used as benchmarks for Kinch scoring.
				</p>
			</Card>

			<div className={styles["results-container"]}>
				{results.map((event) => (
					<Card key={event.eventId} className={styles["event-card"]}>
						<div className={styles["event-header"]}>
							<span className={`cubing-icon event-${event.eventId}`}></span>
							{event.eventName} ({regionName}, {age}+)
						</div>

						<div className={styles["results-container-inner"]}>
							<div className={clsx(styles["results-grid"], event.single && event.average && styles["two-column"])}>
								{event.single && (
									<ResultItem
										type="single"
										result={event.single.result}
										personId={event.single.personId}
										personName={event.single.personName}
										countryId={rankings?.persons[event.single.personId]?.countryId ?? ""}
										date={event.single.date}
										age={age}
										region={region}
									/>
								)}
								{event.average && (
									<ResultItem
										type="average"
										result={event.average.result}
										personId={event.average.personId}
										personName={event.average.personName}
										countryId={rankings?.persons[event.average.personId]?.countryId ?? ""}
										date={event.average.date}
										age={age}
										region={region}
									/>
								)}
							</div>
						</div>
					</Card>
				))}
			</div>
		</KinchLayout>
	);
}

interface ResultItemProps {
	type: "single" | "average";
	result: string;
	personId: string;
	personName: string;
	countryId: string;
	date: string;
	age: string;
	region: string;
}

function ResultItem(props: ResultItemProps) {
	const {type, result, personId, personName, countryId, date, age, region} = props;

	const typeLabel = type === "single" ? "Single" : "Average";
	const isRecent = dateIsRecent(date);
	const personUrl = `${buildKinchPersonRoute(personId)}?age=${age}&region=${region}`;

	return (
		<div className={styles["result-item"]}>
			<div className={styles["result-type"]}>{typeLabel}</div>
			<div className={styles["result-value"]}>{result}</div>
			<div className={styles["result-person"]}>
				<CountryFlag
					countryCode={countryId}
					size="small"
					decorative
				/>
				{" "}
				<Link to={personUrl} className={styles["person-link"]}>
					{personName}
				</Link>
			</div>
			<div className={styles["result-date"]}>
				{date} {isRecent && "🔥"}
			</div>
		</div>
	);
}
