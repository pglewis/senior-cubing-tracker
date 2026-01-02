import {useRegisterSW} from "virtual:pwa-register/react";

// Check for app updates every 30 minutes
const UPDATE_CHECK_INTERVAL = 30 * 60 * 1000;

/**
 * Registers the service worker and sets up periodic update checks.
 * With registerType: "autoUpdate", the page auto-reloads when updates are found.
 */
export function useSwUpdate() {
	useRegisterSW({
		onRegisteredSW(_swUrl, registration) {
			if (registration) {
				setInterval(() => registration.update(), UPDATE_CHECK_INTERVAL);
			}
		},
	});
}
