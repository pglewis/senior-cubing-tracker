import {useEffect, useRef} from "react";

interface UseDataPollingOptions {
	urls: string[];
	interval: number;
	onDataChanged: () => void;
}

type ETagMap = Map<string, string | null>;

/**
 * Hook that periodically checks if remote data files have been updated
 * using ETag headers, then triggers a callback if changes are detected.
 *
 * Uses HEAD requests to minimize bandwidth - only fetches full data if needed.
 */
export function useDataPolling({
	urls,
	interval,
	onDataChanged,
}: UseDataPollingOptions): void {
	const etagsRef = useRef<ETagMap>(new Map());

	useEffect(() => {
		async function checkForUpdates() {
			try {
				const currentEtags: ETagMap = new Map();
				let allFilesChanged = true;

				for (const url of urls) {
					const response = await fetch(url, {method: "HEAD"});
					const eTag = response.headers.get("ETag");
					currentEtags.set(url, eTag);

					const previousETag = etagsRef.current.get(url);
					// Only trigger callback if ALL files have changed since last check
					if (previousETag !== null && previousETag === eTag) {
						allFilesChanged = false;
					}
				}

				etagsRef.current = currentEtags;

				if (allFilesChanged && etagsRef.current.size > 0) {
					onDataChanged();
				}
			} catch (error) {
				// Silently fail and retry on next interval
				console.error("Failed to check for data updates:", error);
			}
		}

		// Run initial check immediately to load data on mount
		void checkForUpdates();

		// Set up polling interval
		const intervalId = setInterval(() => {
			void checkForUpdates();
		}, interval);

		// Cleanup
		return () => clearInterval(intervalId);
	}, [urls, interval, onDataChanged]);
}
