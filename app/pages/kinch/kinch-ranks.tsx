import {useRef} from "react";
import {useLocation} from "react-router";
import {Pagination} from "@repo/app/components/pagination/pagination";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {KinchLeaderboard} from "@repo/app/features/kinch/components/leaderboard/kinch-leaderboard";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {buildKinchPersonRoute} from "@repo/app/routes";
import styles from "./kinch-ranks.module.css";

export function KinchRanks() {
	const ROWS_PER_PAGE = 25;
	const topPaginationRef = useRef<HTMLDivElement>(null);
	const {
		age,
		region,
		page,
		setParams
	} = useKinchContext();
	const {state} = useLocation();
	const kinchRanks = useKinchRanks({age, region});
	const totalPages = Math.ceil(kinchRanks.length / ROWS_PER_PAGE);

	// Pagination
	const handlePageChange = (newPage: number) => {
		const isElementVisible = (element: HTMLElement): boolean => {
			const rect = element.getBoundingClientRect();
			return rect.bottom > 0 && rect.top < window.innerHeight;
		};

		// Override the scroll to top behavior if the top pagination is visible and no highlight is set
		let options = {};
		if (!state?.highlight && topPaginationRef.current && isElementVisible(topPaginationRef.current)) {
			options = {preventScrollReset: true};
		}

		setParams({page: newPage}, options);
	};

	// Leaderboard
	const getPersonUrl = (personId: string) => {
		return buildKinchPersonRoute(personId) + `?age=${age}&region=${region}`;
	};

	return (
		<KinchLayout>
			{totalPages > 1 && (
				<div ref={topPaginationRef}>
					<Pagination
						className={styles.topPagination}
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
					className={styles.bottomPagination}
					currentPage={page}
					totalPages={totalPages}
					onPageChange={handlePageChange}
				/>
			)}
		</KinchLayout>
	);
}