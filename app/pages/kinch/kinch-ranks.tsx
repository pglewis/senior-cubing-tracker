import {useMemo, useRef, useEffect} from "react";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {useData} from "@repo/app/hooks/use-data";
import {Pagination} from "@repo/app/components/pagination/pagination";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {PersonScores} from "@repo/app/features/kinch/components/person-scores/person-scores";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import {Combobox, type ComboboxItem} from "../../components/combobox/combobox";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const ROWS_PER_PAGE = 25;
	const topPaginationRef = useRef<HTMLDivElement>(null);
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
	const navigate = useNavigate();
	const kinchRanks = useKinchRanks({age, region});
	const totalPages = Math.ceil(kinchRanks.length / ROWS_PER_PAGE);

	const ageOptions = useMemo(() => {
		if (!topRanks) return [];

		return Array.from(new Set(topRanks
			.filter(tr => tr.region === region)
			.map(tr => tr.age)
		))
			.sort((a, b) => a - b)
			.map(age => ({value: age.toString(), label: `${age}+`}));
	}, [topRanks, region]);

	useEffect(() => {
		const isElementVisible = (element: HTMLElement): boolean => {
			const rect = element.getBoundingClientRect();
			return rect.bottom > 0 && rect.top < window.innerHeight;
		};

		if (topPaginationRef.current && !isElementVisible(topPaginationRef.current)) {
			window.scrollTo({top: 0, behavior: "smooth"});
		}
	}, [page]);

	const handlePageChange = (newPage: number) => {
		setParams({page: newPage});
	};

	const handleSelect = (item: ComboboxItem) => {
		// Build the return URL with current params
		const currentUrl = `${location.pathname}${location.search}`;

		// Navigate with state instead of using onSelect
		navigate(`/kinch-ranks?wcaid=${item.value}&age=${age}&region=world`, {
			state: {from: currentUrl}
		});

		setParams({wcaid: item.value, age, region, page: 1});
	};

	const filterName = (item: ComboboxItem, searchTerm: string) => {
		return [item.label, item.value].some(field =>
			field.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			<div className={styles.filters}>
				<Combobox
					items={kinchRanks.map(kr => ({value: kr.personId, label: kr.personName}))}
					placeholder="Search by name or WCA ID"
					onSelect={handleSelect}
					filterFn={filterName}
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
					<div ref={topPaginationRef}>
						<Pagination
							currentPage={page}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
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
					onPageChange={handlePageChange}
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