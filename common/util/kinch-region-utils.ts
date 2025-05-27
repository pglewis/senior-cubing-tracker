/**
 * Utilities for handling region identification with prefixes to disambiguate
 * between country and continent codes
 */

/** Prefix for continent region IDs */
export const CONTINENT_PREFIX = "C";

/** Prefix for country (National) region IDs */
export const COUNTRY_PREFIX = "N";

/**
 * Convert internal region ID to URL-safe prefixed version
 * @param id The raw region ID (e.g. "NA")
 * @param isContinent Whether this ID represents a continent
 * @returns Prefixed region ID (e.g. "CNA" or "NNA")
 */
export function toRegionParam(id: string, isContinent: boolean): string {
	if (id === "world") return id;
	return `${isContinent ? CONTINENT_PREFIX : COUNTRY_PREFIX}${id}`;
}

/**
 * Parse a prefixed region parameter back to internal ID
 * @param param The prefixed region parameter (e.g. "CNA" or "NNA")
 * @returns Object containing the raw ID and whether it represents a continent
 */
export function fromRegionParam(param: string): {id: string, isContinent: boolean} {
	if (param === "world") return {id: "world", isContinent: false};
	return {
		id: param.slice(1),
		isContinent: param.startsWith(CONTINENT_PREFIX)
	};
}