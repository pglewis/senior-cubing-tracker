import {createContext} from "react";
import type {ExtendedRankingsData} from "@repo/common/types/rankings-snapshot";
import type {TopRank} from "@repo/common/types/kinch-types";

export interface DataContextType {
	rankings: ExtendedRankingsData | null;
	topRanks: TopRank[] | null;
	isInitializing: boolean;
	error: Error | null;
}

// Fast Refresh requires files with React components to only export components
// so the instance lives here rather than co-located with the data context component
export const DataContext = createContext<DataContextType | null>(null);