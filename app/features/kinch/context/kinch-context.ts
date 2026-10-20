import {createContext} from "react";
import type {NavigateOptions} from "react-router";
import type {Continent, Country} from "@repo/common/types/rankings-snapshot";
import type {ButtonTabOption} from "@repo/app/components/button-tabs/button-tabs";

export interface KinchContextParams {
	page: number,
	age: string,
	/** Prefixed version for URL (e.g. "CNA") */
	region: string,
	wcaid: string,
};

/** Regions available to the region filter */
export interface RegionInfo {
	continents: Continent[],
	countries: Country[],
};

export interface KinchContextType extends Omit<KinchContextParams, "region"> {
	/** Keep prefixed version for URL params */
	region: string,
	regionInfo: RegionInfo,
	/** Age categories with Kinch benchmarks in the selected region */
	ageOptions: ButtonTabOption[],
	// wcaid is no longer part of setParams since it's handled by routing
	setParams: (params: Partial<Omit<KinchContextParams, "wcaid">>, options?: NavigateOptions) => void,
};

export const KinchContext = createContext<KinchContextType | null>(null);