import {useCallback} from "react";
import {useKinchRanks} from "@repo/app/hooks/use-kinch-ranks";
import type {KinchRank} from "@repo/common/types/kinch-types";

interface UseKinchPersonSearchProps {
	age: string;
	region: string;
}

export function useKinchPersonSearch({age, region}: UseKinchPersonSearchProps) {
	const kinchRanks = useKinchRanks({age, region});

	const filterResults = useCallback((term: string): KinchRank[] => {
		if (term.length <= 2) {
			return [];
		}

		return kinchRanks
			.filter(kr =>
				kr.personID.toLowerCase().includes(term.toLowerCase()) ||
				kr.personName.toLowerCase().includes(term.toLowerCase())
			)
			.slice(0, 10);
	}, [kinchRanks]);

	return {filterResults};
}