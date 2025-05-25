export function debounce<T extends unknown[]>(
	callback: (...args: T) => void,
	timeout: number = 300
) {
	let timeoutId: number | null = null;

	return (...args: T) => {
		if (timeoutId !== null) {
			window.clearTimeout(timeoutId);
		}

		timeoutId = window.setTimeout(
			() => callback(...args),
			timeout
		);
	};
}
