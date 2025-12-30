import {useLocation, useNavigationType} from "react-router";
import {useEffect, useRef, useState} from "react";

interface HistoryEntry {
	key: string;
	path: string;
}

interface NavigationState {
	entries: HistoryEntry[];
	currentIndex: number;
}

export function useNavigationHistory() {
	const location = useLocation();
	const navigationType = useNavigationType();
	const [navHistory, setNavHistory] = useState<NavigationState>(() => ({
		entries: [{key: location.key, path: location.pathname + location.search}],
		currentIndex: 0
	}));
	const prevKeyRef = useRef(location.key);

	useEffect(() => {
		const currentPath = location.pathname + location.search;
		const currentKey = location.key;

		// Skip if key hasn't changed (initial render or duplicate navigation)
		if (prevKeyRef.current === currentKey) {
			return;
		}
		prevKeyRef.current = currentKey;

		if (navigationType === "PUSH") {
			// New navigation: add entry, trim forward history
			setNavHistory(prev => ({
				entries: [
					...prev.entries.slice(0, prev.currentIndex + 1),
					{key: currentKey, path: currentPath}
				],
				currentIndex: prev.currentIndex + 1
			}));
		} else if (navigationType === "POP") {
			// Back/forward: find entry by key
			setNavHistory(prev => {
				const foundIndex = prev.entries.findIndex(entry => entry.key === currentKey);
				if (foundIndex !== -1) {
					return {...prev, currentIndex: foundIndex};
				}
				// Key not found (edge case, e.g., page refresh): treat as fresh start
				return {
					entries: [{key: currentKey, path: currentPath}],
					currentIndex: 0
				};
			});
		} else if (navigationType === "REPLACE") {
			// Replace current entry with new key/path
			setNavHistory(prev => {
				const newEntries = [...prev.entries];
				newEntries[prev.currentIndex] = {key: currentKey, path: currentPath};
				return {...prev, entries: newEntries};
			});
		}
	}, [location.pathname, location.search, location.key, navigationType]);

	const goBack = () => {
		if (navHistory.currentIndex > 0) {
			window.history.back();
		}
	};

	const goForward = () => {
		if (navHistory.currentIndex < navHistory.entries.length - 1) {
			window.history.forward();
		}
	};

	return {
		canGoBack: navHistory.currentIndex > 0,
		canGoForward: navHistory.currentIndex < navHistory.entries.length - 1,
		goBack,
		goForward
	};
}
