import {useContext} from "react";
import {KinchContext} from "../contexts/kinch-instance";
import type {KinchContextType} from "../contexts/kinch-types";

export function useKinchContext(): KinchContextType {
	const context = useContext(KinchContext);
	if (!context) {
		throw new Error("useKinchContext must be used within KinchProvider");
	}
	return context;
}