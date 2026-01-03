import {Link, useNavigate, useSearchParams} from "react-router";
import {ROUTES, buildKinchPersonRoute} from "@repo/app/routing/routes";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {CompetitorCombobox} from "@repo/app/components/competitor-combobox/competitor-combobox";
import type {ComboboxItem} from "@repo/app/components/combobox/combobox";
import styles from "./kinch-layout.module.css";

interface KinchLayoutProps {
	children: React.ReactNode;
	availableAgeOptions: {value: string; label: string}[];
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
	const navigate = useNavigate();
	const kinchRanks = useKinchRanks({age, region});

	const handleCompetitorSelect = (item: ComboboxItem) => {
		navigate(buildKinchPersonRoute(item.value) + `?age=${age}&region=world`);
	};

	return (
		<div className={styles.container}>
			<h2>Senior Kinch Ranks</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			<div className={styles.filters}>
				<div className={styles["filter-item"]}>
					<CompetitorCombobox
						items={kinchRanks.map(kr => ({value: kr.personId, label: kr.personName}))}
						onSelect={handleCompetitorSelect}
					/>
				</div>
				<div className={styles["filter-item"]}>
					<RegionFilter
						value={region}
						onChange={(value) => setParams({region: value, page: 1})}
						continents={regionInfo.continents}
						countries={regionInfo.countries}
					/>
				</div>
				<div className={styles["filter-item"]}>
					<ButtonTabs
						selectedValue={age}
						onChange={(value) => setParams({age: value, page: 1}, {preventScrollReset: true})}
						options={availableAgeOptions}
					/>
				</div>
			</div>

			{children}

			<h3>
				<Link to={`${ROUTES.KINCH_FAQ}`} state={{from: `${ROUTES.KINCH_RANKS}?${searchParams.toString()}`}}>
					What are Kinch Ranks?
				</Link>
			</h3>
		</div>
	);
}