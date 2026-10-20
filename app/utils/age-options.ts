import type {ButtonTabOption} from "@repo/app/components/button-tabs/button-tabs";

/** Age category tabs ("40+", "50+", ...) in ascending order */
export function getAgeOptions(ages: Iterable<number>): ButtonTabOption[] {
	return Array.from(new Set(ages))
		.sort((a, b) => a - b)
		.map(age => ({value: age.toString(), label: `${age}+`}));
}
