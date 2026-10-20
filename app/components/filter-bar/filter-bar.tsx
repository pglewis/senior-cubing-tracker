import styles from "./filter-bar.module.css";

interface FilterBarProps {
	children: React.ReactNode;
}

/** Centered column of page controls: search, region, age tabs and related links */
export function FilterBar({children}: FilterBarProps) {
	return <div className={styles["filter-bar"]}>{children}</div>;
}

/** One control in a FilterBar, kept to the standard control width */
export function FilterItem({children}: FilterBarProps) {
	return <div className={styles["filter-item"]}>{children}</div>;
}
