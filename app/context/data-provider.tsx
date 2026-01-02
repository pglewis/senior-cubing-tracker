import {useState, useCallback} from "react";
import {DataContext} from "./data-context";
import {useDataPolling} from "@repo/app/hooks/use-data-polling";
import {BASENAME} from "@repo/app/utils/basename";
import type {EnhancedRankingsData} from "@repo/common/types/enhanced-rankings";
import type {TopRank} from "@repo/common/types/kinch-types";

// Helper function to build URLs with the correct base path
function buildDataUrl(path: string): string {
	// Remove leading slash from path to avoid double slashes
	const cleanPath = path.startsWith("/") ? path.slice(1) : path;

	// Build base URL from normalized basename
	// Empty basename means root, otherwise add trailing slash
	const baseWithSlash = BASENAME ? `${BASENAME}/` : "/";

	return `${baseWithSlash}${cleanPath}`;
}

// Data URLs (stable constants for polling)
const DATA_URLS = [
	buildDataUrl("data/enhanced-rankings.json"),
	buildDataUrl("data/topranks.json"),
];

// Polling interval: 30 minutes
const POLL_INTERVAL = 30 * 60 * 1000;

export function DataProvider({children}: {children: React.ReactNode;}) {
	const [rankings, setRankings] = useState<EnhancedRankingsData | null>(null);
	const [topRanks, setTopRanks] = useState<TopRank[] | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	// Stable reference to loadData for use in polling callback
	// Service worker handles caching via NetworkFirst strategy
	const loadData = useCallback(async() => {
		try {
			const [rankingsRes, topRanksRes] = await Promise.all([
				fetch(DATA_URLS[0]),
				fetch(DATA_URLS[1])
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
	}, []);

	// Polling handles both initial load and periodic updates
	useDataPolling({
		urls: DATA_URLS,
		interval: POLL_INTERVAL,
		onDataChanged: loadData,
	});

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