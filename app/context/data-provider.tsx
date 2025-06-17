import {useState, useEffect} from "react";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";
import {DataContext} from "./data-context";

// Helper function to build URLs with the correct base path
function buildDataUrl(path: string): string {
	const base = import.meta.env.BASE_URL || "/";
	// Remove leading slash from path to avoid double slashes
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;
	// Ensure base ends with slash
	const baseWithSlash = base.endsWith("/") ? base : `${base}/`;
	return `${baseWithSlash}${cleanPath}`;
}

export function DataProvider({children}: {children: React.ReactNode;}) {
	const [rankings, setRankings] = useState<EnhancedRankingsData | null>(null);
	const [topRanks, setTopRanks] = useState<TopRank[] | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		async function loadData() {
			try {
				const [rankingsRes, topRanksRes] = await Promise.all([
					fetch(buildDataUrl("data/enhanced-rankings.json")),
					fetch(buildDataUrl("data/topranks.json"))
				]);

				if (!rankingsRes.ok || !topRanksRes.ok) {
					throw new Error("Failed to fetch data");
				}

				const [rankingsData, topRanksData] = await Promise.all([
					rankingsRes.json(),
					topRanksRes.json()
				]);

				setRankings(rankingsData);
				setTopRanks(topRanksData);
			} catch (err) {
				setError(err instanceof Error ? err : new Error("Unknown error"));
			} finally {
				setIsInitializing(false);
			}
		}

		void loadData();
	}, []);

	if (isInitializing) {
		return <div>Loading rankings...</div>;
	}

	if (error) {
		return <div>Error loading data: {error.message}</div>;
	}

	return (
		<DataContext.Provider value={{rankings, topRanks, isInitializing}}>
			{children}
		</DataContext.Provider>
	);
}