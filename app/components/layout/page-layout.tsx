import {useState, useEffect, useRef} from "react";
import {Outlet, useLocation} from "react-router";
import clsx from "clsx";
import {ThemeToggle} from "@repo/app/components/theme/theme-toggle";
import {NavigationButton} from "@repo/app/components/layout/navigation-button";
import {HamburgerButton} from "@repo/app/components/layout/hamburger-button";
import {NavigationMenu} from "@repo/app/components/layout/navigation-menu";
import {UpdateButton} from "@repo/app/components/layout/update-button";
import {useNavigationHistory} from "@repo/app/hooks/use-navigation-history";
import {useSwUpdate} from "@repo/app/hooks/use-sw-update";
import styles from "./page-layout.module.css";

export function PageLayout() {
	const {canGoBack, canGoForward, goBack, goForward} = useNavigationHistory();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [blockPointerEvents, setBlockPointerEvents] = useState(false);
	const hamburgerRef = useRef<HTMLButtonElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const {pathname} = useLocation();

	// Registers SW and sets up periodic update checks
	const {needsUpdate, updateApp} = useSwUpdate();

	// Scroll content to top on route change
	useEffect(() => {
		contentRef.current?.scrollTo(0, 0);
	}, [pathname]);

	// Prevent touch bleed-through after navigation
	useEffect(() => {
		setBlockPointerEvents(true);
		const timer = setTimeout(() => {
			setBlockPointerEvents(false);
		}, 150);

		return () => clearTimeout(timer);
	}, [pathname]);

	return (
		<div className={styles["app-shell"]}>
			<header className={styles.header}>
				<div className={styles["header-content"]}>
					<div className={styles["header-left"]}>
						<HamburgerButton
							ref={hamburgerRef}
							isOpen={isMenuOpen}
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						/>
						<UpdateButton needsUpdate={needsUpdate} onUpdate={updateApp} />
					</div>
					<div className={styles["header-center"]}>
						<NavigationButton
							direction="back"
							onClick={goBack}
							disabled={!canGoBack}
						/>
						<NavigationButton
							direction="forward"
							onClick={goForward}
							disabled={!canGoForward}
						/>
					</div>
					<div className={styles["header-right"]}>
						<ThemeToggle />
					</div>
				</div>
			</header>
			<main className={styles["main-container"]}>
				<NavigationMenu
					isOpen={isMenuOpen}
					onClose={() => setIsMenuOpen(false)}
					hamburgerRef={hamburgerRef}
				/>
				<div ref={contentRef} className={clsx(styles["content-wrapper"], blockPointerEvents && styles["block-pointer-events"])}>
					<Outlet />
				</div>
			</main>
		</div>
	);
}
