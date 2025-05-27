export interface KinchContextParams {
    page: number;
    age: string;
    region: string; // Prefixed version for URL (e.g. "CNA")
    wcaid: string;
}

export interface RegionInfo {
    id: string; // Unprefixed ID (e.g. "NA")
    type: "continent" | "country" | "world";
}

export interface KinchContextType extends Omit<KinchContextParams, "region"> {
    region: string; // Keep prefixed version for URL params
    regionInfo: RegionInfo;
    setParams: (params: Partial<KinchContextParams>) => void;
}