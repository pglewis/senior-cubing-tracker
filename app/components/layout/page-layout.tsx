import {Outlet, ScrollRestoration} from "react-router";
import {MainNav} from "@repo/app/components/navigation/main-nav";
import {ThemeToggle} from "@repo/app/components/layout/theme-toggle";
import styles from "./page-layout.module.css";

export function PageLayout() {
	return (
		<>
			<header className={styles.header}>
				<MainNav />
				<h2>Senior Cubing Tracker</h2>
				<ThemeToggle />
			</header>
			<main className={styles.container}>
				<Outlet />
				<ScrollRestoration />
			</main>
		</>
	);
}