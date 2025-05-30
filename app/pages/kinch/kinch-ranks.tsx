import {useMemo} from "react";
import {Link, useSearchParams, useLocation} from "react-router-dom";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {getFilteredRegions} from "@repo/app/features/kinch/utils/get-filtered-regions";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {AgeFilter} from "@repo/app/features/kinch/components/filters/age-filter";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {PersonSearch} from "@repo/app/features/kinch/components/person-search/person-search";
import {Pagination} from "@repo/app/components/shared/pagination";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import styles from "./kinch-ranks.module.css";
import {DataLastUpdated} from "../../components/data-last-updated";

export function KinchRanks() {
	const {rankings, topRanks} = useData();
	const {age, wcaid, region, regionInfo, page, setParams} = useKinchContext();
	const {state} = useLocation();
	const [searchParams] = useSearchParams();

	console.log(rankings.data.persons.find(p => p.wca_id === wcaid));

	const kinchRanks = useKinchRanks({age, region});

	const {continents, countries} = useMemo(() => (
		getFilteredRegions(
			rankings,
			wcaid,
			age,
			topRanks
		)
	), [rankings, topRanks, wcaid, age]);

	// Extract the display name for the selected region ("World", "Europe", "Italy")
	let regionName: string;
	if (regionInfo.type === "world") {
		regionName = regionInfo.type;
	} else if (regionInfo.type === "continent") {
		regionName = rankings.data.continents[rankings.continentIDToIndex[regionInfo.id]].name;
	} else {
		regionName = rankings.data.countries[rankings.countryIDToIndex[regionInfo.id]].name;
	}

	const totalPages = Math.ceil(kinchRanks.length / 25);

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>
			<h3>
				<Link
					to="/kinch-ranks/faq"
					state={{from: `/kinch-ranks?${searchParams.toString()}`}}
				>
					What are Kinch Ranks?
				</Link>
			</h3>

			<div className={styles.filters}>
				<PersonSearch
					value={wcaid}
					onSelect={(value) => setParams({wcaid: value, region: "world"})}
					age={age}
					region={region} // Prefixed with continent/country prefix
				/>
				<AgeFilter
					value={age}
					onChange={(value) => setParams({age: value, page: 1})}
					region={region}
				/>
				<RegionFilter
					value={region}
					onChange={(value) => setParams({region: value, page: 1})}
					continents={continents}
					countries={countries}
				/>
				{totalPages > 1 && !wcaid && (
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={(newPage) => setParams({page: newPage})}
					/>
				)}
			</div>

			<DataLastUpdated text={rankings.lastUpdated} />

			{wcaid ? (
				<PersonScores
					onAgeChange={(value) => setParams({age: value, page: 1})}
					wcaId={wcaid}
					age={age}
					region={region}
					regionName={regionName} // The raw region ID, regardless of whether continent or country
				/>
			) : (
				<KinchLeaderboard
					age={age}
					region={region}
					highlightId={state?.highlight}
				/>
			)}
		</div>
	);
}