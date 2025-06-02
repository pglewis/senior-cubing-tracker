import {useMemo} from "react";
import {useData} from "@repo/app/hooks/use-data";
import {ButtonTabs} from "@repo/app/components/shared/button-tabs";

interface AgeFilterProps {
	value: string;
	onChange: (value: string) => void;
	region: string;
}

export function AgeFilter({value, onChange, region}: AgeFilterProps) {
	const {topRanks} = useData();

	const ageOptions = useMemo(() => {
		if (!topRanks) return [];

		return Array.from(new Set(topRanks
			.filter(tr => tr.region === region)
			.map(tr => tr.age)
		))
			.sort((a, b) => a - b)
			.map(age => ({value: age.toString(), label: `${age}+`}));
	}, [topRanks, region]);

	return (
		<ButtonTabs
			selectedValue={value}
			onChange={onChange}
			options={ageOptions}
		/>
	);
}