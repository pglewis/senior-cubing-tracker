import {Outlet} from "react-router-dom";
import {MainNav} from "@repo/app/components/navigation/main-nav";
import {ThemeToggle} from "@repo/app/components/layout/theme-toggle";
import styles from "./page-layout.module.css";

export function PageLayout() {
	return (
		<>
			<header className={styles.header}>
				<div className={styles.headerLeft}>
					<MainNav />
				</div>
				<h2>Senior Cubing Tracker</h2>
				<div className={styles.headerRight}>
					<ThemeToggle />
				</div>
			</header>
			<main className={styles.container}>
				<Outlet />
			</main>
		</>
	);
}