import {useState} from "react";
import {Link} from "react-router";
import {ROUTES} from "@repo/app/routes";
import {KofiButton} from "../kofi-button/kofi-button";
import styles from "./main-nav.module.css";

export function MainNav() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className={styles.nav}>
			<button
				className={styles.hamburger}
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Toggle navigation menu"
				aria-expanded={isOpen}
				aria-controls="main-navigation"
			>
				<div className={styles.icon}>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</button>
			<nav
				id="main-navigation"
				className={`${styles.menu} ${isOpen ? styles.open : ""}`}
			>
				<div className={styles.links}>
					<Link to={ROUTES.HOME} onClick={() => setIsOpen(false)}>Home</Link>
					<Link to={ROUTES.RECENT} onClick={() => setIsOpen(false)}>Recent Senior Records</Link>
					<Link to={ROUTES.KINCH_RANKS} onClick={() => setIsOpen(false)}>Senior Kinch Ranks</Link>
					<Link to={ROUTES.PROFILE} onClick={() => setIsOpen(false)}>Senior Profiles</Link>
				</div>
				<div className={styles.menuFooter}>
					<KofiButton />
				</div>
			</nav>
		</div>
	);
}