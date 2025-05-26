import {useContext} from "react";
import {DataContext} from "@repo/app/contexts/data-instance";
import type {DataContextType} from "@repo/app/contexts/data-types";

interface InitializedData extends DataContextType {
	rankings: NonNullable<DataContextType["rankings"]>;
	topRanks: NonNullable<DataContextType["topRanks"]>;
	isInitializing: false;
	error: null;
}

export function useData(): InitializedData {
	const context = useContext(DataContext);

	if (!context) {
		throw new Error("useData must be used within a DataProvider");
	}
	if (context.isInitializing) { // Changed condition
		throw new Error("Data is still initializing");
	}
	if (context.error) {
		throw new Error("Data failed to load");
	}
	if (!context.rankings || !context.topRanks) {
		throw new Error("Rankings data not available");
	}

	return context as InitializedData;
}