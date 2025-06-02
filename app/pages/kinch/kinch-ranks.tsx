import {useMemo} from "react";
import {Link, useLocation, useSearchParams} from "react-router-dom";
import {useData} from "@repo/app/hooks/use-data";
import {Pagination} from "@repo/app/components/shared/pagination";
import {ButtonTabs} from "@repo/app/components/shared/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {PersonSearch} from "@repo/app/features/kinch/components/person-search/person-search";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const {rankings, topRanks} = useData();
	const {
		age,
		wcaid,
		region,
		regionInfo,
		page,
		setParams
	} = useKinchContext();
	const {state} = useLocation();
	const [searchParams] = useSearchParams();
	const kinchRanks = useKinchRanks({age, region});

	const ageOptions = useMemo(() => {
		if (!topRanks) return [];

		return Array.from(new Set(topRanks
			.filter(tr => tr.region === region)
			.map(tr => tr.age)
		))
			.sort((a, b) => a - b)
			.map(age => ({value: age.toString(), label: `${age}+`}));
	}, [topRanks, region]);


	const totalPages = Math.ceil(kinchRanks.length / 25);

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>

			<DataLastUpdated text={rankings.lastUpdated} />
			<div className={styles.filters}>
				<PersonSearch
					age={age}
					region={region} // Prefixed with continent/country prefix
				/>
				<RegionFilter
					value={region}
					onChange={(value) => setParams({region: value, page: 1})}
					continents={regionInfo.continents}
					countries={regionInfo.countries}
				/>
				<ButtonTabs
					selectedValue={age}
					onChange={(value) => setParams({age: value, page: 1})}
					options={ageOptions}
				/>
				{totalPages > 1 && !wcaid && (
					<Pagination
						currentPage={page}
						totalPages={totalPages}
						onPageChange={(newPage) => setParams({page: newPage})}
					/>
				)}
			</div>

			{wcaid ? (
				<PersonScores
					wcaId={wcaid}
					age={age}
					region={region}
					regionInfo={regionInfo}
				/>
			) : (
				<KinchLeaderboard
					age={age}
					region={region}
					highlightId={state?.highlight}
				/>
			)}

			{totalPages > 1 && !wcaid && (
				<Pagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={(newPage) => setParams({page: newPage})}
				/>
			)}

			<h3>
				<Link to="/kinch-ranks/faq" state={{from: `/kinch-ranks?${searchParams.toString()}`}}>
					What are Kinch Ranks?
				</Link>
			</h3>
		</div>
	);
}