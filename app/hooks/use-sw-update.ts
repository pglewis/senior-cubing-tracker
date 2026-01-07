import {useEffect, useRef, useState} from "react";
import {useRegisterSW} from "virtual:pwa-register/react";
import {useOnlineStatus} from "./use-online-status";

// Check for app updates every 5 minutes for quick update detection
const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;

type SessionPhase = "initial" | "active";

/**
 * Registers the service worker and sets up periodic update checks.
 *
 * Update behavior based on session phase:
 * - Initial phase: Auto-apply updates silently (user just loaded/reloaded page)
 * - Active phase: Show update prompt (polling/reconnect detected update mid-session)
 *
 * This ensures users get seamless updates on page load, but aren't surprised
 * by unexpected UI changes during active use.
 */
export function useSwUpdate() {
	const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
	const sessionPhaseRef = useRef<SessionPhase>("initial");
	const [sessionPhase, setSessionPhase] = useState<SessionPhase>("initial");
	const isOnline = useOnlineStatus();

	// Keep ref in sync with state
	useEffect(() => {
		sessionPhaseRef.current = sessionPhase;
	}, [sessionPhase]);

	const {
		needRefresh: [needsUpdate],
		updateServiceWorker,
	} = useRegisterSW({
		onNeedRefresh() {
			// Auto-apply if we're still in initial phase (page just loaded/reloaded)
			if (sessionPhaseRef.current === "initial") {
				updateServiceWorker(true);
			}
			// Otherwise we're in active phase - show prompt (normal behavior)
		},
		onRegisteredSW(_swUrl, registration) {
			if (registration) {
				registrationRef.current = registration;

				// Transition to active phase after giving SW time to detect updates
				// 3 seconds should be enough for SW to check and call onNeedRefresh if needed
				setTimeout(() => {
					setSessionPhase("active");
				}, 3000);

				// Start polling for updates
				setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL);
			}
		},
	});

	// Check for updates immediately when coming back online
	useEffect(() => {
		if (isOnline && registrationRef.current) {
			void registrationRef.current.update();
		}
	}, [isOnline]);

	const updateApp = () => {
		updateServiceWorker(true);
	};

	const exposedNeedsUpdate = needsUpdate && sessionPhase === "active";

	// Only expose needsUpdate during active phase (for prompting user)
	return {
		needsUpdate: exposedNeedsUpdate,
		updateApp,
	};
}
