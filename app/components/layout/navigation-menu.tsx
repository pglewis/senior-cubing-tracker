import {useEffect, useRef, type RefObject} from "react";
import {Link} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import {KofiButton} from "@repo/app/components/kofi-button/kofi-button";
import styles from "./navigation-menu.module.css";

interface NavigationMenuProps {
	isOpen: boolean;
	onClose: () => void;
	hamburgerRef: RefObject<HTMLButtonElement | null>;
}

export function NavigationMenu({isOpen, onClose, hamburgerRef}: NavigationMenuProps) {
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isOpen) {
				onClose();
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const clickedMenu = menuRef.current?.contains(target);
			const clickedHamburger = hamburgerRef.current?.contains(target);

			if (!clickedMenu && !clickedHamburger) {
				onClose();
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
	}, [isOpen, onClose, hamburgerRef]);

	return (
		<>
			<nav
				id="main-navigation"
				className={`${styles.menu} ${isOpen ? styles.open : ""}`}
				ref={menuRef}
			>
				<div className={styles["menu-links"]}>
					<Link to={ROUTES.HOME} className={styles["menu-link"]} onClick={onClose}>Home</Link>
					<Link to={ROUTES.PROFILE} className={styles["menu-link"]} onClick={onClose}>Senior Profile Pages</Link>
					<Link to={ROUTES.KINCH_RANKS} className={styles["menu-link"]} onClick={onClose}>Senior Kinch Ranks</Link>
					<Link to={ROUTES.KINCH_FAQ} className={styles["menu-link"]} onClick={onClose}>Kinch Ranks FAQ</Link>
					<Link to={ROUTES.COMPETITOR_DATA_FAQ} className={styles["menu-link"]} onClick={onClose}>Competitor Data FAQ</Link>
					<a href="https://pglewis.github.io/wca-recent-senior-records/recent/" target="_blank" rel="noopener noreferrer" className={styles["menu-link"]} onClick={onClose}>Recent Senior Records</a>
				</div>
				<div className={styles["menu-footer"]}>
					<KofiButton />
				</div>
			</nav>
			<div
				className={`${styles.backdrop} ${isOpen ? styles.open : ""}`}
				onClick={onClose}
			></div>
		</>
	);
}
