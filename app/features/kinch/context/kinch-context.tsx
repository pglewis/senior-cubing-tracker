import {useMemo, type ReactNode} from "react";
import {useSearchParams} from "react-router";
import type {Continent, Country, ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";
import {fromRegionParam, toRegionParam} from "@repo/common/util/kinch-region-utils";
import {useData} from "@repo/app/hooks/use-data";
import type {KinchContextParams, KinchContextType, RegionInfo} from "./kinch-context-types";
import {KinchContext} from "./kinch-instance";

const defaults = {
	page: 1,
	age: "40",
	region: "world",
	wcaid: ""
} as const;

export function KinchProvider({children}: {children: ReactNode;}) {
	const {rankings, topRanks} = useData();
	const [searchParams, setSearchParams] = useSearchParams();

	const page = Number(searchParams.get("page")) || defaults.page;
	const age = searchParams.get("age") || defaults.age;
	const wcaid = searchParams.get("wcaid") || defaults.wcaid;

	const setParams = (params: Partial<KinchContextParams>) => {
		const newParams = new URLSearchParams(searchParams);
		for (const [key, value] of Object.entries(params)) {
			if (value && value !== defaults[key as keyof typeof defaults]) {
				newParams.set(key, String(value));
			} else {
				newParams.delete(key);
			}
		}
		setSearchParams(newParams);
	};

	const region = searchParams.get("region") || defaults.region;
	const {id, isContinent} = fromRegionParam(region);

	let regionType: RegionInfo["type"];
	if (id === "world") {
		regionType = "world";
	} else if (isContinent) {
		regionType = "continent";
	} else {
		regionType = "country";
	}

	const {continents, countries} = useMemo(() => (
		getFilteredRegions(
			rankings,
			wcaid,
			age,
			topRanks
		)
	), [rankings, topRanks, wcaid, age]);

	const regionInfo: RegionInfo = {
		id,
		type: regionType,
		continents: continents,
		countries: countries,
	};

	const value: KinchContextType = {
		page: page,
		age: age,
		wcaid: wcaid,
		region,
		regionInfo,
		setParams,
	};

	return (
		<KinchContext.Provider value={value}>
			{children}
		</KinchContext.Provider>
	);
}

interface FilteredRegions {
	continents: Continent[],
	countries: Country[],
}

function getFilteredRegions(
	rankings: ExtendedRankingsData,
	wcaId: string | undefined,
	age: string,
	topRanks: TopRank[]
): FilteredRegions {
	const {continents, countries} = rankings.data;

	if (wcaId) {
		const person = rankings.data.persons[rankings.personIdToIndex[wcaId]];
		const country = rankings.data.countries[rankings.countryIdToIndex[person.country]];
		const continent = continents.find(c => c.id === country.continent);

		return {
			continents: continent ? [continent] : [],
			countries: [country]
		};
	}

	return {
		continents: continents.filter(c =>
			topRanks.some(tr =>
				tr.age === Number(age) &&
				tr.region === toRegionParam(c.id, true)
			)
		),
		countries: countries.filter(c =>
			topRanks.some(tr =>
				tr.age === Number(age) &&
				tr.region === toRegionParam(c.id, false)
			)
		)
	};
}
