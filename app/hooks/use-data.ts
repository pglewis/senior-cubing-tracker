import {useContext} from "react";
import {DataContext} from "@repo/app/context/data-context";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";

export type DataStatus = "loading" | "ready" | "error";

export interface DataContextType {
	status: DataStatus;
	rankings: EnhancedRankingsData | null;
	topRanks: TopRank[] | null;
	error: Error | null;
	refresh: () => Promise<boolean>;
}


export interface InitializedData extends DataContextType {
	status: "ready";
	rankings: NonNullable<DataContextType["rankings"]>;
	topRanks: NonNullable<DataContextType["topRanks"]>;
}

export function useDataOptional(): DataContextType {
	const context = useContext(DataContext);

	if (!context) {
		throw new Error("useDataOptional must be used within a DataProvider");
	}

	return context;
}

export function useDataRequired(): InitializedData {
	const context = useDataOptional();

	if (context.status !== "ready" || !context.rankings || !context.topRanks) {
		throw new Error("Rankings data not available");
	}

	return context as InitializedData;
}

// Backwards-compatible alias for call sites that assume data is ready.
export function useData(): InitializedData {
	return useDataRequired();
}