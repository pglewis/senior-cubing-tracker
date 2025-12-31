
export interface MultiResult {
	/* solved minus unsolved */
	score: number,
	seconds: number,
	unsolved: number;
}

/**
 *
 * @param result - Format: Solved/Attempted in MM:SS - Example: 3/4 in 38:05
 * @returns
 */
export function parseMultiResult(result: string): MultiResult {
	const [solvedAndAttempted, time] = result.split(" in ");
	const [solved, attempted] = solvedAndAttempted.split("/").map(Number);
	const unsolved = attempted - solved;
	const score = solved - unsolved;
	const seconds = timeResultToSeconds(time);

	return {score, seconds, unsolved};
}

/**
 *
 * @param result - Minutes and hours are not padded if zero: 23.27, 1:40.83, 1:00:02
 * @returns      The duration in seconds
 */
export function timeResultToSeconds(result: string): number {
	const parts = result.split(":").reverse();
	let seconds = 0;
	let multiplier = 1;

	for (const part of parts) {
		seconds += Number(part) * multiplier;
		multiplier *= 60;
	}

	return seconds;
}

export function dateIsRecent(dateString: string): boolean {
	const RECENT_THRESHOLD_DAYS = 30;
	const diffTime = new Date().getTime() - new Date(dateString).getTime();
	const daysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	return daysElapsed <= RECENT_THRESHOLD_DAYS;
}
