import {Link, useNavigate, useSearchParams} from "react-router";
import {ROUTES, buildKinchPersonRoute} from "@repo/app/routes";
import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useKinchRanks} from "@repo/app/features/kinch/hooks/use-kinch-ranks";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {RegionFilter} from "@repo/app/features/kinch/components/filters/region-filter";
import {Combobox, type ComboboxItem} from "@repo/app/components/combobox/combobox";
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
					onChange={(value) => setParams({age: value, page: 1}, {preventScrollReset: true})}
					options={availableAgeOptions}
				/>
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