import {useEffect, useState, useCallback, type ReactNode} from "react";
import type {ResolvedTheme, ThemeOption} from "./theme-types";
import {ThemeContext} from "./theme-context";

interface ThemeProviderProps {
	children: ReactNode;
}

export function ThemeProvider({children}: ThemeProviderProps) {
	const [theme, setTheme] = useState<ThemeOption>("system"); // Default fallback
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

	const getSystemTheme = useCallback((): ResolvedTheme => {
		return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
	}, []);

	const resolveTheme = useCallback((themeOption: ThemeOption): ResolvedTheme => {
		if (themeOption === "system") {
			return getSystemTheme();
		}
		return themeOption;
	}, [getSystemTheme]);

	const applyTheme = useCallback((resolvedTheme: ResolvedTheme) => {
		document.documentElement.setAttribute("data-theme", resolvedTheme);
	}, []);

	const updateTheme = (newTheme: ThemeOption) => {
		setTheme(newTheme);
		localStorage.setItem("theme", newTheme);

		const resolved = resolveTheme(newTheme);
		setResolvedTheme(resolved);
		applyTheme(resolved);
	};

	// Initialize theme on mount
	useEffect(() => {
		// Priority: user override → system → dark fallback
		const savedTheme = localStorage.getItem("theme") as ThemeOption | null;
		const initialTheme: ThemeOption = savedTheme || "system";

		const resolved = resolveTheme(initialTheme);

		setTheme(initialTheme);
		setResolvedTheme(resolved);
		applyTheme(resolved);
	}, [resolveTheme, applyTheme]);

	// Listen for system theme changes
	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const newResolved = getSystemTheme();
			setResolvedTheme(newResolved);
			applyTheme(newResolved);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme, getSystemTheme, applyTheme]);

	return (
		<ThemeContext.Provider value={{theme, resolvedTheme, setTheme: updateTheme}}>
			{children}
		</ThemeContext.Provider>
	);
}