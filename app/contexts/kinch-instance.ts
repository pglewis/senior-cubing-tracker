import {createContext} from "react";
import type {KinchContextType} from "./kinch-types";

export const KinchContext = createContext<KinchContextType | null>(null);