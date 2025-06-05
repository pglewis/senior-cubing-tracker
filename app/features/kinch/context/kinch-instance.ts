import {createContext} from "react";
import type {KinchContextType} from "./kinch-context-types";

export const KinchContext = createContext<KinchContextType | null>(null);