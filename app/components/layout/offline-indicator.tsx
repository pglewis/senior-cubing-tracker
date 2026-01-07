import styles from "./offline-indicator.module.css";

export function OfflineIndicator() {
	return (
		<div className={styles.container} role="status" aria-label="Offline">
			<span className={styles.dot} aria-hidden="true"></span>
			<span className="sr-only">Offline</span>
		</div>
	);
}
