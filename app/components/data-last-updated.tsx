import styles from "./data-last-updated.module.css";

interface DataLastUpdatedProps {
    text: string;
}

export function DataLastUpdated({text}: DataLastUpdatedProps) {
	return (
		<div className={styles.lastUpdated}>
			Data last refreshed: {text}
		</div>
	);
}