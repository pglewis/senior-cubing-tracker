import {useMemo, type ReactNode} from "react";
import {useParams, useSearchParams, type NavigateOptions} from "react-router";
import type {Continent, Country} from "@repo/common/types/rankings-snapshot";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";
import {fromRegionParam, toRegionParam} from "@repo/common/util/kinch-region-utils";
import {useData} from "@repo/app/hooks/use-data";
import type {KinchContextParams, KinchContextType, RegionInfo} from "./kinch-context";
import {KinchContext} from "./kinch-context";

const defaults = {
	page: 1,
	age: "40",
	region: "world",
} as const;

export function KinchProvider({children}: {children: ReactNode;}) {
	const {rankings, topRanks} = useData();
	const [searchParams, setSearchParams] = useSearchParams();
	const params = useParams();

	const page = Number(searchParams.get("page")) || defaults.page;
	const age = searchParams.get("age") || defaults.age;

	// Get wcaid from route params instead of search params
	const wcaid = params.wcaid || "";

	// Remove wcaid from setParams since it's handled by routing
	const setParams = (newParams: Partial<Omit<KinchContextParams, "wcaid">>, options?: NavigateOptions) => {
		const updatedParams = new URLSearchParams(searchParams);

		for (const [key, value] of Object.entries(newParams)) {
			if (value && value !== defaults[key as keyof typeof defaults]) {
				// Non empty, non default values are set
				updatedParams.set(key, String(value));
			} else {
				// Empty or default values are removed
				updatedParams.delete(key);
			}
		}

		setSearchParams(updatedParams, options);
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
	rankings: EnhancedRankingsData | null,
	wcaId: string | undefined,
	age: string,
	topRanks: TopRank[] | null
): FilteredRegions {
	if (!rankings || !topRanks) {
		return {continents: [], countries: []};
	}

	// Convert enhanced rankings structure to arrays for compatibility
	const continents = Object.values(rankings.continents);
	const countries = Object.values(rankings.countries);

	if (wcaId) {
		const person = rankings.persons[wcaId];
		if (!person) {
			return {continents: [], countries: []};
		}

		const country = rankings.countries[person.countryId];
		const continent = rankings.continents[person.continentId];

		return {
			continents: continent ? [continent] : [],
			countries: country ? [country] : []
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