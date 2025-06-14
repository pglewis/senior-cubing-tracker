import styles from "./kofi-button.module.css";

export function KofiButton() {
	return (
		<div className={styles.container}>
			<a
				title="Support me on ko-fi.com"
				className={styles.button}
				href="https://ko-fi.com/J3J217WVE9"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span className={styles.text}>
					<img
						src="https://storage.ko-fi.com/cdn/cup-border.png"
						alt="Ko-fi donations"
						className={styles.img}
					/>
					Support the site
				</span>
			</a>
		</div>
	);
}