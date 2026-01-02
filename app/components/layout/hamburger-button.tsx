import {forwardRef} from "react";
import styles from "./hamburger-button.module.css";

interface HamburgerButtonProps {
	isOpen: boolean;
	onClick: () => void;
}

export const HamburgerButton = forwardRef<HTMLButtonElement, HamburgerButtonProps>(
	({isOpen, onClick}, ref) => {
		return (
			<button
				ref={ref}
				className={styles.button}
				onClick={onClick}
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
		);
	}
);

HamburgerButton.displayName = "HamburgerButton";
