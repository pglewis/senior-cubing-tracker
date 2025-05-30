import {useTheme} from "@repo/app/hooks/use-theme";
import type {ThemeOption} from "@repo/app/contexts/theme-types";

const themeOptions: Array<{value: ThemeOption; label: string;}> = [
	{value: "light", label: "Light"},
	{value: "dark", label: "Dark"},
	{value: "system", label: "System"},
];

export function ThemeToggle() {
	const {theme, setTheme} = useTheme();

	return (
		<select
			value={theme}
			onChange={(e) => setTheme(e.target.value as ThemeOption)}
			aria-label="Select theme"
		>
			{themeOptions.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	);
}