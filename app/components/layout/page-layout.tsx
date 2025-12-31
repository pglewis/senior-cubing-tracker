import {useState, useEffect, useRef} from "react";
import {Outlet, Link, useLocation} from "react-router";
import {ROUTES} from "@repo/app/routing/routes";
import {ThemeToggle} from "@repo/app/components/theme/theme-toggle";
import {KofiButton} from "@repo/app/components/kofi-button/kofi-button";
import {useNavigationHistory} from "@repo/app/hooks/use-navigation-history";
import styles from "./page-layout.module.css";

export function PageLayout() {
	const {canGoBack, canGoForward, goBack, goForward} = useNavigationHistory();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const {pathname} = useLocation();

	// Scroll content to top on route change
	useEffect(() => {
		contentRef.current?.scrollTo(0, 0);
	}, [pathname]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape" && isMenuOpen) {
				setIsMenuOpen(false);
			}
		};

		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const clickedMenu = menuRef.current?.contains(target);
			const clickedHamburger = hamburgerRef.current?.contains(target);

			if (!clickedMenu && !clickedHamburger) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener("keydown", handleEscape);
			document.addEventListener("click", handleClickOutside);

			return () => {
				document.removeEventListener("keydown", handleEscape);
				document.removeEventListener("click", handleClickOutside);
			};
		}
	}, [isMenuOpen]);


	return (
		<div className={styles["app-shell"]}>
			<header className={styles.header}>
				<div className={styles["header-content"]}>
					<div className={styles["header-row-1"]}>
						<button
							ref={hamburgerRef}
							className={styles.hamburger}
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							aria-label="Toggle navigation menu"
							aria-expanded={isMenuOpen}
							aria-controls="main-navigation"
						>
							<div className={styles["hamburger-icon"]}>
								<span className={styles["hamburger-icon-bar"]}></span>
								<span className={styles["hamburger-icon-bar"]}></span>
								<span className={styles["hamburger-icon-bar"]}></span>
							</div>
						</button>
						<button
							className={styles["back-button"]}
							onClick={goBack}
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
						<button
							className={styles["forward-button"]}
							onClick={goForward}
							disabled={!canGoForward}
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
						<ThemeToggle />
					</div>
					<div className={styles["header-row-2"]}>
						<h2>Senior Cubing Tracker</h2>
					</div>
				</div>
			</header>
			<main className={styles["main-container"]}>
				<nav
					id="main-navigation"
					className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}
					ref={menuRef}
				>
					<div className={styles["menu-links"]}>
						<Link to={ROUTES.HOME} className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Home</Link>
						<Link to={ROUTES.PROFILE} className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Senior Profile Pages</Link>
						<Link to={ROUTES.KINCH_RANKS} className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Senior Kinch Ranks</Link>
						<Link to={ROUTES.KINCH_FAQ} className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Kinch Ranks FAQ</Link>
						<Link to={ROUTES.COMPETITOR_DATA_FAQ} className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Competitor Data FAQ</Link>
						<a href="https://pglewis.github.io/wca-recent-senior-records/recent/" target="_blank" rel="noopener noreferrer" className={styles["menu-link"]} onClick={() => setIsMenuOpen(false)}>Recent Senior Records</a>
					</div>
					<div className={styles["menu-footer"]}>
						<KofiButton />
					</div>
				</nav>
				<div
					className={`${styles.backdrop} ${isMenuOpen ? styles.open : ""}`}
					onClick={() => setIsMenuOpen(false)}
				></div>
				<div ref={contentRef} className={styles["content-wrapper"]}>
					<Outlet />
				</div>
			</main>
		</div>
	);
}
