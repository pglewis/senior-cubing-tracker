import {useState, useEffect, useRef} from "react";
import {Link} from "react-router";
import {ROUTES} from "@repo/app/routes";
import {KofiButton} from "../kofi-button/kofi-button";
import styles from "./main-nav.module.css";

export function MainNav() {
	const [isOpen, setIsOpen] = useState(false);
	const navRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.addEventListener("click", handleClickOutside);

			return () => {
				document.removeEventListener("keydown", handleEscape);
				document.removeEventListener("click", handleClickOutside);
			};
		}
	}, [isOpen]);

	return (
		<div className={styles.nav} ref={navRef}>
			<button
				className={styles.hamburger}
				onClick={() => setIsOpen(!isOpen)}
				aria-label="Toggle navigation menu"
				aria-expanded={isOpen}
				aria-controls="main-navigation"
			>
				<div className={styles.icon}>
					<span className={styles["icon-bar"]}></span>
					<span className={styles["icon-bar"]}></span>
					<span className={styles["icon-bar"]}></span>
				</div>
			</button>
			<div className={`${styles["menu-wrapper"]} ${isOpen ? styles.open : ""}`}>
				<nav
					id="main-navigation"
					className={`${styles.menu} ${isOpen ? styles.open : ""}`}
				>
					<div className={styles.links}>
						<Link to={ROUTES.HOME} className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Home</Link>
						<Link to={ROUTES.PROFILE} className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Senior Profile Pages</Link>
						<Link to={ROUTES.KINCH_RANKS} className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Senior Kinch Ranks</Link>
						<Link to={ROUTES.KINCH_FAQ} className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Kinch Ranks FAQ</Link>
						<Link to={ROUTES.COMPETITOR_DATA_FAQ} className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Competitor Data FAQ</Link>
						<a href="https://pglewis.github.io/wca-recent-senior-records/recent/" target="_blank" rel="noopener noreferrer" className={styles["menu-link"]} onClick={() => setIsOpen(false)}>Recent Senior Records</a>
					</div>
					<div className={styles["menu-footer"]}>
						<KofiButton />
					</div>
				</nav>
			</div>
		</div>
	);
}