import type {NavigateOptions} from "react-router";
import type {Continent, Country} from "@repo/common/types/rankings-snapshot";

export interface KinchContextParams {
    page: number,
	age: string,
	/** Prefixed version for URL (e.g. "CNA") */
    region: string,
    wcaid: string,
};

export interface RegionInfo {
	/** Unprefixed id (e.g. "NA") */
    id: string,
    type: "continent" | "country" | "world",
	continents: Continent[],
	countries: Country[],

};

export interface KinchContextType extends Omit<KinchContextParams, "region"> {
	/** Keep prefixed version for URL params */
    region: string,
    regionInfo: RegionInfo,
    setParams: (params: Partial<KinchContextParams>, options?: NavigateOptions) => void,
};