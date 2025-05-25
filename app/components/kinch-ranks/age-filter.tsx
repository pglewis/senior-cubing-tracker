import type {ChangeEvent} from "react";
import {useData} from "@repo/app/hooks/use-data";
import type {TopRank} from "@repo/common/types/kinch-types";

interface AgeFilterProps {
	value: string;
	onChange: (value: string) => void;
	region: string;
}

function getAgeList(topRanks: TopRank[], region: string): number[] {
	return Array.from(
		new Set(
			topRanks
				.filter(tr => tr.region === region)
				.map(tr => tr.age)
		)
	).sort((a, b) => a - b);
}

export function AgeFilter({value, onChange, region}: AgeFilterProps) {
	const {topRanks} = useData();
	const ageOptions = topRanks ? getAgeList(topRanks, region) : [];

	const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
		onChange(e.target.value);
	};

	return (
		<div>
			<select value={value} onChange={handleChange}>
				{ageOptions.map(age => (
					<option key={age} value={String(age)}>
						Over {age}
					</option>
				))}
			</select>
		</div>
	);
}