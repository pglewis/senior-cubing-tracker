export interface KinchContextParams {
    page: number;
    age: string;
    region: string;
    wcaid: string;
}

export interface KinchContextType extends KinchContextParams {
    setParams: (params: Partial<KinchContextParams>) => void;
}