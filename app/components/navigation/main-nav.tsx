import {useState} from "react";
import {Link} from "react-router-dom";
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
			>
				<div className={styles.icon}>
					<span></span>
					<span></span>
					<span></span>
				</div>
			</button>
			<nav className={`${styles.menu} ${isOpen ? styles.open : ""}`}>
				<div className={styles.links}>
					<Link to="/" onClick={() => setIsOpen(false)}>Home</Link>
					<Link to="/recent" onClick={() => setIsOpen(false)}>Recent Senior Records</Link>
					<Link to="/kinch-ranks" onClick={() => setIsOpen(false)}>Senior Kinch Ranks</Link>
					<Link to="/results" onClick={() => setIsOpen(false)}>Senior Profiles</Link>
				</div>
				<div className={styles.menuFooter}>
					<KofiButton />
				</div>
			</nav>
		</div>
	);
}