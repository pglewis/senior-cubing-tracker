import {useState, useCallback, useEffect} from "react";
import {useKinchRanks} from "@repo/app/hooks/use-kinch-ranks";
import {debounce} from "@repo/common/util/debounce";

interface UseSearchBoxProps {
	value: string;
	age: string;
	region: string;
}

export function useSearchBox({value, age, region}: UseSearchBoxProps) {
	const kinchRanks = useKinchRanks({age, region});
	const [searchTerm, setSearchTerm] = useState(value);
	const [filteredResults, setFilteredResults] = useState<typeof kinchRanks>([]);

	const filterResults = useCallback((term: string) => {
		if (term.length <= 2) {
			setFilteredResults([]);
			return;
		}

		const lowerTerm = term.toLowerCase();
		const results = kinchRanks
			.filter(rank =>
				rank.personID.toLowerCase().includes(lowerTerm) ||
				rank.personName.toLowerCase().includes(lowerTerm)
			)
			.slice(0, 10);

		setFilteredResults(results);
	}, [kinchRanks]);

	useEffect(() => {
		setSearchTerm(value);
	}, [value]);

	return {
		searchTerm,
		filteredResults,
		setSearchTerm,
		filterResults: debounce(filterResults, 350)
	};
}