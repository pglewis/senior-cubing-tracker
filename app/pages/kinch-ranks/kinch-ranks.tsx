import {useMemo} from "react";
import {useData} from "@repo/app/hooks/use-data";
import {Link} from "react-router-dom";
import {getFilteredRegions} from "./helpers/get-filtered-regions";
import {useKinchRanks} from "@repo/app/hooks/use-kinch-ranks";
import {useKinchParams} from "@repo/app/hooks/use-kinch-params";
import {AgeFilter} from "@repo/app/components/kinch-ranks/age-filter";
import {RegionFilter} from "@repo/app/components/kinch-ranks/region-filter";
import {PersonSearch} from "@repo/app/components/kinch-ranks/person-search";
import {Pagination} from "@repo/app/components/kinch-ranks/pagination";
import {PersonScores} from "@repo/app/components/kinch-ranks/person-scores";
import {KinchLeaderboard} from "@repo/app/components/kinch-ranks/kinch-leaderboard";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const {rankings, topRanks} = useData();
	const {age, region, wcaid, page, setParams} = useKinchParams();
	const kinchRanks = useKinchRanks({age, region});

	const {continents, countries} = useMemo(() => (
		getFilteredRegions(
			rankings,
			wcaid,
			age,
			topRanks
		)
	), [rankings, topRanks, wcaid, age]);

	const totalPages = Math.ceil(kinchRanks.length / 25);

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>
			<h3><Link to="/kinch-ranks/faq">What are Kinch Ranks?</Link></h3>

			<div className={styles.filters}>
				<PersonSearch
					value={wcaid}
					onSelect={(value) => setParams({wcaid: value, region: "world"})}
					age={age}
					region={region}
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

			{wcaid ? (
				<PersonScores wcaId={wcaid} age={age} />
			) : (
				<KinchLeaderboard age={age} region={region} />
			)}
		</div>
	);
}