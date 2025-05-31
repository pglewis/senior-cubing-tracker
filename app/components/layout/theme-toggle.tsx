import {useTheme} from "@repo/app/hooks/use-theme";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
	const {theme, setTheme} = useTheme();
	const isDark = theme === "dark";

	const handleToggle = (): void => {
		setTheme(isDark ? "light" : "dark");
	};

	return (
		<button
			onClick={handleToggle}
			className={`${styles.switcher} ${isDark ? styles.dark : styles.light}`}
			aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
		>
			<div className={`${styles.slider} ${isDark ? styles.sliderDark : styles.sliderLight}`}>
				{isDark ? (<MoonIcon />) : (<SunIcon />)}
			</div>
		</button>
	);
};

function MoonIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}

function SunIcon() {
	return (
		<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
			<circle cx="12" cy="12" r="5" />
			<line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" stroke-width="2" />
			<line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" />
			<line x1="4.22" y1="4.22" x2="6.64" y2="6.64" stroke="currentColor" stroke-width="2" />
			<line x1="17.36" y1="17.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2" />
			<line x1="1" y1="12" x2="5" y2="12" stroke="currentColor" stroke-width="2" />
			<line x1="19" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2" />
			<line x1="4.22" y1="19.78" x2="6.64" y2="17.36" stroke="currentColor" stroke-width="2" />
			<line x1="17.36" y1="6.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2" />
		</svg>
	);
}