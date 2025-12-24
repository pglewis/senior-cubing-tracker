import {useLocation} from "react-router";
import {useEffect, useRef, useState} from "react";

export function useNavigationHistory() {
	const location = useLocation();
	const [backStackSize, setBackStackSize] = useState(0);
	const [forwardStackSize, setForwardStackSize] = useState(0);
	const navigationInitiatedRef = useRef<"back" | "forward" | null>(null);
	const prevLocationRef = useRef<string | null>(null);

	useEffect(() => {
		const currentPath = location.pathname + location.search;

		// Skip on initial render
		if (prevLocationRef.current === null) {
			prevLocationRef.current = currentPath;
			return;
		}

		// Skip if location hasn't actually changed
		if (prevLocationRef.current === currentPath) {
			return;
		}

		prevLocationRef.current = currentPath;

		if (navigationInitiatedRef.current === "back") {
			navigationInitiatedRef.current = null;
			setBackStackSize(prev => prev - 1);
			setForwardStackSize(prev => prev + 1);
		} else if (navigationInitiatedRef.current === "forward") {
			navigationInitiatedRef.current = null;
			setBackStackSize(prev => prev + 1);
			setForwardStackSize(prev => prev - 1);
		} else {
			setBackStackSize(prev => prev + 1);
			setForwardStackSize(0);
		}
	}, [location.pathname, location.search]);

	const goBack = () => {
		if (backStackSize === 0) return;

		navigationInitiatedRef.current = "back";
		window.history.back();
	};

	const goForward = () => {
		if (forwardStackSize === 0) return;

		navigationInitiatedRef.current = "forward";
		window.history.forward();
	};

	return {
		canGoBack: backStackSize > 0,
		canGoForward: forwardStackSize > 0,
		goBack,
		goForward
	};
}
