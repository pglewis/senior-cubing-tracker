import {useState, useCallback, useEffect, useRef} from "react";
import {DataContext} from "./data-context";
import {useDataPolling} from "@repo/app/hooks/use-data-polling";
import {BASENAME} from "@repo/app/utils/basename";
import {useOnlineStatus} from "@repo/app/hooks/use-online-status";
import {DATA_FILENAME, DATA_DIR} from "@repo/common/data-constants";
import type {DataStatus} from "@repo/app/hooks/use-data";
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

// Data URL (stable constant for polling)
const DATA_URL = buildDataUrl(`${DATA_DIR}/${DATA_FILENAME}`);

// Polling interval: 5 minutes for quick update detection
const POLL_INTERVAL = 5 * 60 * 1000;

export function DataProvider({children}: {children: React.ReactNode;}) {
	const [rankings, setRankings] = useState<EnhancedRankingsData | null>(null);
	const [topRanks, setTopRanks] = useState<TopRank[] | null>(null);
	const [status, setStatus] = useState<DataStatus>("loading");
	const [error, setError] = useState<Error | null>(null);
	const isOnline = useOnlineStatus();
	const isRefreshingRef = useRef(false);
	const hasLoadedOnceRef = useRef(false);

	const loadData = useCallback(async(): Promise<boolean> => {
		if (isRefreshingRef.current) {
			return false;
		}
		isRefreshingRef.current = true;
		const hasExistingData = hasLoadedOnceRef.current;

		if (!hasExistingData) {
			setStatus("loading");
		}

		try {
			setError(null);
			const response = await fetch(DATA_URL);

			if (!response.ok) {
				throw new Error("Failed to fetch data");
			}

			const data: EnhancedRankingsData = await response.json();

			setRankings(data);
			setTopRanks(data.topRanks);
			setStatus("ready");
			hasLoadedOnceRef.current = true;
			return true;
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Unknown error"));
			if (!hasExistingData) {
				setStatus("error");
			}
			return false;
		} finally {
			isRefreshingRef.current = false;
		}
	}, []);

	// Initial load
	useEffect(() => {
		void loadData();
	}, [loadData]);

	// Polling hook
	useDataPolling({
		url: DATA_URL,
		interval: POLL_INTERVAL,
		enabled: isOnline,
		onDataChanged: loadData,
	});

	return (
		<DataContext.Provider value={{status, rankings, topRanks, error, refresh: loadData}}>
			{children}
		</DataContext.Provider>
	);
}
