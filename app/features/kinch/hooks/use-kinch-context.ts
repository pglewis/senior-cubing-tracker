import {useContext} from "react";
import type {KinchContextType} from "../context/kinch-types";
import {KinchContext} from "../context/kinch-instance";

export function useKinchContext(): KinchContextType {
	const context = useContext(KinchContext);
	if (!context) {
		throw new Error("useKinchContext must be used within KinchProvider");
	}
	return context;
}