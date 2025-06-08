import {useContext} from "react";
import {ThemeContext} from "../context/theme-context";
import type {ThemeContextType} from "../context/theme-types";

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}