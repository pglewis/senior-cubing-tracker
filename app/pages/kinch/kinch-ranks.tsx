import {useRef, useMemo} from "react";
import {useLocation} from "react-router";
import {buildKinchPersonRoute} from "@repo/app/routing/routes";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import {Pagination} from "@repo/app/components/pagination/pagination";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const ROWS_PER_PAGE = 25;
	const topPaginationRef = useRef<HTMLDivElement>(null);
	const {topRanks} = useData();
	const {
		age,
		region,
		page,
		setParams
	} = useKinchContext();
	const {state} = useLocation();
	const kinchRanks = useKinchRanks({age, region});
	const totalPages = Math.ceil(kinchRanks.length / ROWS_PER_PAGE);

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

	// Pagination
	const handlePageChange = (newPage: number) => {
		const isElementVisible = (element: HTMLElement): boolean => {
			const rect = element.getBoundingClientRect();
			return rect.bottom > 0 && rect.top < window.innerHeight;
		};

		// Anti-jank: override the scroll to top behavior if the
		// top pagination is visible and no highlight is set
		let options = {};
		if (!state?.highlight && topPaginationRef.current && isElementVisible(topPaginationRef.current)) {
			options = {preventScrollReset: true};
		}

		setParams({page: newPage}, options);
	};

	const getPersonUrl = (personId: string) => {
		return buildKinchPersonRoute(personId) + `?age=${age}&region=${region}`;
	};

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			{totalPages > 1 && (
				<div ref={topPaginationRef}>
					<Pagination
						className={styles["top-pagination"]}
						currentPage={page}
						totalPages={totalPages}
						onPageChange={handlePageChange}
					/>
				</div>
			)}

			<KinchLeaderboard
				displayRanks={kinchRanks.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE)}
				startIdx={(page - 1) * ROWS_PER_PAGE}
				getPersonUrl={getPersonUrl}
				highlightId={state?.highlight}
			/>

			{totalPages > 1 && (
				<Pagination
					className={styles["bottom-pagination"]}
					currentPage={page}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}
		</KinchLayout>
	);
}