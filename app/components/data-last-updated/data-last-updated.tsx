import styles from "./data-last-updated.module.css";

export function DataLastUpdated({text}: {text: string;}) {
	return (
		<div className={styles["last-updated"]}>
			Data last refreshed: {text}</div>
	);
}