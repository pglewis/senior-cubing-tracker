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
				{isDark ? (
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
						<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
					</svg>
				) : (
					<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
						<circle cx="12" cy="12" r="5"/>
						<path d="m12 1-1 2-1-2zm0 18-1 2-1-2zm11-5-2 1 2 1zM4 12l-2 1 2 1zm15.5-6.5L18 7l1.5-1.5zM5.5 18.5 7 17l-1.5 1.5zm13 0L17 17l1.5 1.5zM5.5 5.5 7 7 5.5 5.5z"/>
					</svg>
				)}
			</div>
		</button>
	);
};