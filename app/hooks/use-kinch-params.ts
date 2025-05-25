import {useSearchParams} from "react-router-dom";

interface KinchParams {
	page: number;
	age: string;
	region: string;
	wcaid: string;
}

const defaults: KinchParams = {
	page: 1,
	age: "40",
	region: "world",
	wcaid: ""
} as const;

export function useKinchParams() {
	const [searchParams, setSearchParams] = useSearchParams();

	const setParams = (params: Partial<KinchParams>) => {
		const newParams = new URLSearchParams(searchParams);

		for (const [key, value] of Object.entries(params)) {
			const defaultValue = defaults[key as keyof KinchParams];

			if (value && value !== defaultValue) {
				newParams.set(key, String(value));
			} else {
				newParams.delete(key);
			}
		}

		setSearchParams(newParams);
	};

	return {
		page: Number(searchParams.get("page")) || defaults.page,
		age: searchParams.get("age") || defaults.age,
		region: searchParams.get("region") || defaults.region,
		wcaid: searchParams.get("wcaid") || defaults.wcaid,
		setParams
	};
}