import {useMemo, useRef, useEffect} from "react";
import {Link, useLocation, useNavigate, useSearchParams} from "react-router-dom";
import {useData} from "@repo/app/hooks/use-data";
import {Pagination} from "@repo/app/components/pagination/pagination";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import {Combobox, type ComboboxItem} from "../../components/combobox/combobox";
import {ROUTES, buildKinchPersonRoute} from "../../routes";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const ROWS_PER_PAGE = 25;
	const topPaginationRef = useRef<HTMLDivElement>(null);
	const {rankings, topRanks} = useData();
	const {
		age,
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

		// Don't scroll to top if we have a highlight to show
		if (state?.highlight) {
			return;
		}

		if (topPaginationRef.current && !isElementVisible(topPaginationRef.current)) {
			// 	window.scrollTo({top: 0, behavior: "smooth"});
		}
	}, [page, state?.highlight]);

	// Pagination
	const handlePageChange = (newPage: number) => {
		setParams({page: newPage});
	};

	// Leaderboard
	const getPersonUrl = (personId: string) => {
		return buildKinchPersonRoute(personId) + `?age=${age}&region=${region}`;
	};

	// Name search
	const handleNameSearchSelect = (item: ComboboxItem) => {
		navigate(buildKinchPersonRoute(item.value) + `?age=${age}&region=world`);
		setParams({age, region, page: 1});
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
					onSelect={handleNameSearchSelect}
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
				{totalPages > 1 && (
					<div ref={topPaginationRef}>
						<Pagination
							currentPage={page}
							totalPages={totalPages}
							onPageChange={handlePageChange}
						/>
					</div>
				)}
			</div>

			<KinchLeaderboard
				displayRanks={kinchRanks.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)}
				startIdx={(page - 1) * ROWS_PER_PAGE}
				getPersonUrl={getPersonUrl}
				highlightId={state?.highlight}
			/>

			{totalPages > 1 && (
				<Pagination
					currentPage={page}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}

			<h3>
				<Link to={`${ROUTES.KINCH_FAQ}`} state={{from: `${ROUTES.KINCH_RANKS}?${searchParams.toString()}`}}>
					What are Kinch Ranks?
				</Link>
			</h3>
		</div>
	);
}