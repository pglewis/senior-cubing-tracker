import {useRef, useEffect} from "react";
import {useLocation} from "react-router-dom";
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
			//--!! Something needs to be done here, our logic reversed with a new route + ScrollRestoration
			// window.scrollTo({top: 0, behavior: "smooth"});
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