import {useMemo} from "react";
import {useDataOptional} from "@repo/app/hooks/use-data";
import {isResultInRegion} from "@repo/common/util/region-utils";
import {getBestResult} from "@repo/common/util/best-result";
import {getRecordHolder} from "@repo/common/util/event-records";
import type {EnhancedRankingsData, FlatResult} from "@repo/common/types/enhanced-rankings";
import type {EventRecord, EventRecords} from "@repo/common/types/event-records";
import type {Continent, Country} from "@repo/common/types/rankings-snapshot";
import type {ButtonTabOption} from "@repo/app/components/button-tabs/button-tabs";
import {getAgeOptions} from "@repo/app/utils/age-options";

interface RecordsFilters {
	age: string;
	// Prefixed region id (e.g. "CNA" or "NNA")
	region: string;
}

interface RecordsData {
	records: EventRecords[];
	ageOptions: ButtonTabOption[];
	continents: Continent[];
	countries: Country[];
}

export function useRecords({age, region}: RecordsFilters): RecordsData {
	const {rankings} = useDataOptional();

	const records = useMemo(() => getRecords(rankings, age, region), [rankings, age, region]);
	const ageOptions = useMemo(() => getRegionAgeOptions(rankings, region), [rankings, region]);
	const regions = useMemo(() => getRegions(rankings, age), [rankings, age]);

	return {records, ageOptions, ...regions};
}

function getRecords(rankings: EnhancedRankingsData | null, age: string, region: string): EventRecords[] {
	if (!rankings) {
		return [];
	}

	const targetAge = parseInt(age);
	const resultsByEventType = new Map<string, FlatResult[]>();

	for (const result of rankings.results) {
		if (result.age !== targetAge || !isResultInRegion(result, region)) {
			continue;
		}

		const key = `${result.eventId}-${result.type}`;
		if (!resultsByEventType.has(key)) {
			resultsByEventType.set(key, []);
		}
		resultsByEventType.get(key)!.push(result);
	}

	const records: EventRecords[] = [];

	for (const eventId of rankings.eventOrder) {
		const single = getEventRecord(rankings, resultsByEventType.get(`${eventId}-single`) ?? []);
		const average = getEventRecord(rankings, resultsByEventType.get(`${eventId}-average`) ?? []);

		if (single || average) {
			records.push({eventId, eventName: rankings.events[eventId].name, single, average});
		}
	}

	return records;
}

function getEventRecord(rankings: EnhancedRankingsData, results: FlatResult[]): EventRecord | undefined {
	const best = getBestResult(results);
	if (!best) {
		return undefined;
	}

	return {
		result: best.result,
		holders: best.holders.map(holder => getRecordHolder(rankings, holder)),
	};
}

// Only offer age categories that have results in the selected region
function getRegionAgeOptions(rankings: EnhancedRankingsData | null, region: string): RecordsData["ageOptions"] {
	if (!rankings) {
		return [];
	}

	return getAgeOptions(rankings.results.filter(result => isResultInRegion(result, region)).map(result => result.age));
}

// Only offer regions that have results for the selected age
function getRegions(rankings: EnhancedRankingsData | null, age: string): Pick<RecordsData, "continents" | "countries"> {
	if (!rankings) {
		return {continents: [], countries: []};
	}

	const targetAge = parseInt(age);
	const continentIds = new Set<string>();
	const countryIds = new Set<string>();

	for (const result of rankings.results) {
		if (result.age === targetAge) {
			continentIds.add(result.continentId);
			countryIds.add(result.countryId);
		}
	}

	return {
		continents: Object.values(rankings.continents).filter(c => continentIds.has(c.id)),
		countries: Object.values(rankings.countries).filter(c => countryIds.has(c.id)),
	};
}
