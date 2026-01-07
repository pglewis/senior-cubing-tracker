import {useEffect, useRef} from "react";

interface UseDataPollingOptions {
	url: string;
	interval: number;
	enabled?: boolean;
	onDataChanged: () => Promise<boolean> | boolean;
}

/**
 * Hook that periodically checks if remote data file has been updated
 * using ETag headers, then triggers a callback if changes are detected.
 *
 * Uses HEAD requests to minimize bandwidth - only fetches full data if needed.
 */
export function useDataPolling({
	url,
	interval,
	enabled = true,
	onDataChanged,
}: UseDataPollingOptions): void {
	// Baseline ETag corresponds to the last accepted data version
	const baselineEtagRef = useRef<string | null>(null);

	useEffect(() => {
		if (!enabled) {
			return;
		}

		async function checkForUpdates() {
			try {
				const response = await fetch(url, {
					method: "HEAD",
					cache: "no-store",
				});

				if (!response.ok) {
					return;
				}

				const currentETag = response.headers.get("ETag");
				if (!currentETag) {
					return;
				}

				// First successful poll establishes baseline only
				if (baselineEtagRef.current === null) {
					baselineEtagRef.current = currentETag;
					return;
				}

				// Check if data has changed
				if (currentETag !== baselineEtagRef.current) {
					const didRefreshSucceed = await onDataChanged();
					if (didRefreshSucceed) {
						baselineEtagRef.current = currentETag;
					}
				}
			} catch (error) {
				// Silently fail and retry on next interval
				console.error("Failed to check for data updates:", error);
			}
		}

		// Run once immediately (baseline capture or possible update check)
		void checkForUpdates();

		// Set up polling interval
		const intervalId = setInterval(() => {
			void checkForUpdates();
		}, interval);

		// Cleanup
		return () => clearInterval(intervalId);
	}, [url, interval, enabled, onDataChanged]);
}
