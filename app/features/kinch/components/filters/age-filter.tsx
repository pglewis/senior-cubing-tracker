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

	// const ageOptions = useMemo(() => {
	// 	if (!topRanks) return [];

	// 	return Array.from(new Set(topRanks
	// 		.filter(tr => tr.region === region)
	// 		.map(tr => tr.age)
	// 	))
	// 		.sort((a, b) => a - b)
	// 		.map(age => ({value: age.toString(), label: `${age}+`}));
	// }, [topRanks, region]);

	//--!! 	Hardcoded
	const ageOptions = [
		{label: "40+", value: "40"},
		{label: "50+", value: "50"},
		{label: "60+", value: "60"},
		{label: "70+", value: "70"},
	];

	const handleChange = (value: string) => {
		onChange(value);
	};

	return (
		<ButtonTabs
			selectedValue={value}
			onValueChange={handleChange}
			options={ageOptions}
		/>
	);
}