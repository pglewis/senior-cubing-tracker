import {useContext} from "react";
import type {KinchContextType} from "@repo/app/features/kinch/context/kinch-context";
import {KinchContext} from "@repo/app/features/kinch/context/kinch-context";

export function useKinchContext(): KinchContextType {
	const context = useContext(KinchContext);
	if (!context) {
		throw new Error("useKinchContext must be used within KinchProvider");
	}
	return context;
}