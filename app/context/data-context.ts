import {createContext} from "react";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";

export interface DataContextType {
	rankings: EnhancedRankingsData | null;
	topRanks: TopRank[] | null;
	isInitializing: boolean;
}

// Fast Refresh requires files with React components to only export components
// so the instance lives here rather than co-located with the data context component
export const DataContext = createContext<DataContextType | null>(null);