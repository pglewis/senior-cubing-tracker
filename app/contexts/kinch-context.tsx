import {type ReactNode} from "react";
import {useSearchParams} from "react-router-dom";
import {KinchContext} from "./kinch-instance";
import type {KinchContextParams} from "./kinch-types";

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

	const value = {
		page: Number(searchParams.get("page")) || defaults.page,
		age: searchParams.get("age") || defaults.age,
		region: searchParams.get("region") || defaults.region,
		wcaid: searchParams.get("wcaid") || defaults.wcaid,
		setParams
	};

	return (
		<KinchContext.Provider value={value}>
			{children}
		</KinchContext.Provider>
	);
}
