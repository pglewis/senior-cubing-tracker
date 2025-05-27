import {type ReactNode} from "react";
import {useSearchParams} from "react-router-dom";
import {fromRegionParam} from "@repo/common/util/kinch-region-utils";
import type {KinchContextParams, KinchContextType, RegionInfo} from "./kinch-types";
import {KinchContext} from "./kinch-instance";

const defaults = {
	page: 1,
	age: "40",
	region: "world",
	wcaid: ""
} as const;

export function KinchProvider({children}: {children: ReactNode}) {
	const [searchParams, setSearchParams] = useSearchParams();

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

	const regionInfo: RegionInfo = {
		id,
		type: regionType
	};

	const value: KinchContextType = {
		page: Number(searchParams.get("page")) || defaults.page,
		age: searchParams.get("age") || defaults.age,
		region,
		regionInfo,
		wcaid: searchParams.get("wcaid") || defaults.wcaid,
		setParams,
	};

	return (
		<KinchContext.Provider value={value}>
			{children}
		</KinchContext.Provider>
	);
}
