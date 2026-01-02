import styles from "./navigation-button.module.css";

interface NavigationButtonProps {
	direction: "back" | "forward";
	onClick: () => void;
	disabled: boolean;
}

export function NavigationButton({direction, onClick, disabled}: NavigationButtonProps) {
	const isBack = direction === "back";
	const label = isBack ? "Go back to previous page" : "Go forward to next page";
	const path = isBack
		? "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
		: "M4 13h12.17l-5.59 5.59L12 20l8-8-8-8-1.41 1.41L16.17 11H4v2z";

	return (
		<button
			className={styles.button}
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
		>
			<svg
				aria-hidden="true"
				viewBox="0 0 24 24"
				width="24"
				height="24"
				fill="currentColor"
			>
				<path d={path} />
			</svg>
		</button>
	);
}
