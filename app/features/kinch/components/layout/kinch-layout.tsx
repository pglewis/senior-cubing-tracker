import {Link, useNavigate, useParams, useSearchParams, useLocation} from "react-router";
import {ROUTES, buildKinchPersonRoute} from "@repo/app/routing/routes";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {ButtonTabs, type ButtonTabOption} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {FilterBar, FilterItem} from "@repo/app/components/filter-bar/filter-bar";
import {PageContainer} from "@repo/app/components/page-container/page-container";
import {RegionFilter} from "@repo/app/components/region-filter/region-filter";
import {CompetitorCombobox} from "@repo/app/components/competitor-combobox/competitor-combobox";
import type {ComboboxItem} from "@repo/app/components/combobox/combobox";

interface KinchLayoutProps {
	children: React.ReactNode;
	availableAgeOptions: ButtonTabOption[];
}

export function KinchLayout({children, availableAgeOptions}: KinchLayoutProps) {
	const {rankings} = useData();
	const {
		age,
		region,
		regionInfo,
		setParams
	} = useKinchContext();
	const [searchParams] = useSearchParams();
	const location = useLocation();
	const navigate = useNavigate();
	const {ranks: kinchRanks} = useKinchRanks({age, region});

	const handleCompetitorSelect = (item: ComboboxItem) => {
		navigate(buildKinchPersonRoute(item.value) + `?age=${age}&region=world`);
	};

	const {wcaid} = useParams<{wcaid?: string;}>();
	const isOnTopResults = location.pathname.includes("top-results");
	const isOnPersonScores = Boolean(wcaid);
	const subtitle = isOnTopResults ? "Top Kinch Results" : isOnPersonScores ? "Competitor Scores" : "Leaderboard";

	return (
		<PageContainer>
			<h2>Senior Kinch Ranks: {subtitle}</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			<FilterBar>
				<FilterItem>
					<CompetitorCombobox
						items={kinchRanks.map(kr => ({value: kr.personId, label: kr.personName}))}
						onSelect={handleCompetitorSelect}
					/>
				</FilterItem>
				<FilterItem>
					<RegionFilter
						value={region}
						onChange={(value) => setParams({region: value, page: 1})}
						continents={regionInfo.continents}
						countries={regionInfo.countries}
					/>
				</FilterItem>
				<FilterItem>
					<ButtonTabs
						selectedValue={age}
						onChange={(value) => setParams({age: value, page: 1}, {preventScrollReset: true})}
						options={availableAgeOptions}
					/>
				</FilterItem>
				{(isOnTopResults || isOnPersonScores) && (
					<FilterItem>
						<Link to={`${ROUTES.KINCH_RANKS}?age=${age}&region=${region}`}>
							View the Leaderboard
						</Link>
					</FilterItem>
				)}
				{isOnTopResults && (
					<FilterItem>
						<Link to={`${ROUTES.RECORDS}?age=${age}&region=${region}`}>
							View All Event Records
						</Link>
					</FilterItem>
				)}
				{!isOnTopResults && (
					<FilterItem>
						<Link to={`${ROUTES.KINCH_TOP_RESULTS}?age=${age}&region=${region}`}>
							View Top Kinch Results
						</Link>
					</FilterItem>
				)}
			</FilterBar>

			{children}

			<h3>
				<Link to={`${ROUTES.KINCH_FAQ}`} state={{from: `${ROUTES.KINCH_RANKS}?${searchParams.toString()}`}}>
					What are Kinch Ranks?
				</Link>
			</h3>
		</PageContainer>
	);
}
