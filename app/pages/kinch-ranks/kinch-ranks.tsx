import {Link} from "react-router-dom";
import {useKinchParams} from "@repo/app/hooks/use-kinch-params";
import {useData} from "@repo/app/hooks/use-data";
import {SearchBox} from "@repo/app/components/kinch-ranks/search-box";
import {AgeFilter} from "@repo/app/components/kinch-ranks/age-filter";
import {RegionFilter} from "@repo/app/components/kinch-ranks/region-filter";
import {getFilteredRegions} from "./helpers/get-filtered-regions";
import {useMemo} from "react";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const {rankings, topRanks, isInitializing, error} = useData();
	const {page, age, region, wcaid, setParams} = useKinchParams();

	const {continents, countries} = useMemo(() => (
		rankings && topRanks
			? getFilteredRegions(
				rankings,
				wcaid,
				age,
				topRanks
			)
			: {continents: [], countries: []}
	), [rankings, topRanks, wcaid, age]);

	if (error) {
		return <div className="error">Failed to load data: {error.message}</div>;
	}

	if (isInitializing) {
		return <div>Loading rankings...</div>;
	}

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>
			<h3><Link to="/kinch-ranks/faq">What are Kinch Ranks?</Link></h3>

			<div className={styles.filters}>
				<SearchBox
					value={wcaid}
					onSelect={(value) => setParams({wcaid: value, region: "world"})} // Fix: wcaId -> wcaid
					age={age}
					region={region}
				/>
				<AgeFilter
					value={age}
					onChange={(value) => setParams({age: value})}
					region={region}
				/>
				<RegionFilter
					value={region}
					onChange={(value) => setParams({region: value})}
					continents={continents}
					countries={countries}
				/>
			</div>

			<div>
				Page: {page}<br />
				Age: {age}<br />
				Region: {region}<br />
				WCA ID: {wcaid}<br />
			</div>
		</div>
	);
}