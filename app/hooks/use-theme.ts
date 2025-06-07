import {useContext} from "react";
import {ThemeContext} from "@repo/app/contexts/theme-context";
import type {ThemeContextType} from "@repo/app/contexts/theme-types";

export function useTheme(): ThemeContextType {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}