import styles from "./page-container.module.css";

interface PageContainerProps {
	children: React.ReactNode;
}

/** Centered, width-limited column for a data page's content */
export function PageContainer({children}: PageContainerProps) {
	return <div className={styles.container}>{children}</div>;
}
