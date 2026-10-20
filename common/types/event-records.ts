import type {WCAEventId} from "@repo/common/types/rankings-snapshot";

export interface RecordHolder {
	personId: string;
	personName: string;
	countryId: string;
	date: string;
	/** Age category the result was achieved in */
	achievementAge: number;
}

export interface EventRecord {
	result: string;
	holders: RecordHolder[];
}

/** The best single and/or average for one event in an age category and region */
export interface EventRecords {
	eventId: WCAEventId;
	eventName: string;
	single?: EventRecord;
	average?: EventRecord;
}
