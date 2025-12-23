import {useState, useEffect} from "react";
import {Outlet, ScrollRestoration} from "react-router";
import {MainNav} from "@repo/app/components/navigation/main-nav";
import {ThemeToggle} from "@repo/app/components/theme/theme-toggle";
import styles from "./page-layout.module.css";

export function PageLayout() {
	const [canGoBack, setCanGoBack] = useState(false);

	useEffect(() => {
		setCanGoBack(window.history.length > 1);
	}, []);

	const handleBack = () => {
		window.history.back();
	};

	const handleForward = () => {
		window.history.forward();
	};

	return (
		<>
			<header className={styles.header}>
				<div className={styles["header-content"]}>
					<button
						className={styles["back-button"]}
						onClick={handleBack}
						disabled={!canGoBack}
						aria-label="Go back to previous page"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
						>
							<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
						</svg>
					</button>
					<MainNav />
					<h2>Senior Cubing Tracker</h2>
					<ThemeToggle />
					<button
						className={styles["forward-button"]}
						onClick={handleForward}
						aria-label="Go forward to next page"
					>
						<svg
							aria-hidden="true"
							viewBox="0 0 24 24"
							width="24"
							height="24"
							fill="currentColor"
						>
							<path d="M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z" />
						</svg>
					</button>
				</div>
			</header>
			<main className={styles.container}>
				<Outlet />
				<ScrollRestoration />
			</main>
		</>
	);
}
