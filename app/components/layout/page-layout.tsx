import {Outlet} from "react-router-dom";
import {MainNav} from "../navigation/main-nav";
import styles from "./page-layout.module.css";

export function PageLayout() {
	return (
		<>
			<header className={styles.header}>
				<MainNav />
				<h2>Senior Cubing Tracker</h2>
			</header>
			<main className={styles.container}>
				<Outlet />
			</main>
		</>
	);
}
