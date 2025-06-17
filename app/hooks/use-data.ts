import {useContext} from "react";
import {DataContext} from "@repo/app/context/data-context";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";

export interface DataContextType {
	rankings: EnhancedRankingsData | null;
	topRanks: TopRank[] | null;
	isInitializing: boolean;
}

interface InitializedData extends DataContextType {
	rankings: NonNullable<DataContextType["rankings"]>;
	topRanks: NonNullable<DataContextType["topRanks"]>;
	isInitializing: false;
}

export function useData(): InitializedData {
	const context = useContext(DataContext);

	if (!context) {
		throw new Error("useData must be used within a DataProvider");
	}
	if (context.isInitializing) { // Changed condition
		throw new Error("Data is still initializing");
	}
	if (!context.rankings || !context.topRanks) {
		throw new Error("Rankings data not available");
	}

	return context as InitializedData;
}