import styles from "./update-button.module.css";

interface UpdateButtonProps {
	needsUpdate: boolean;
	onUpdate: () => void;
}

export function UpdateButton({needsUpdate, onUpdate}: UpdateButtonProps) {
	return (
		<button
			className={styles.button}
			onClick={onUpdate}
			aria-label="Update application"
			style={{visibility: needsUpdate ? "visible" : "hidden"}}
		>
			<span className={styles.dot}></span>
			<span className={styles.callout}>Update Available</span>
		</button>
	);
}
