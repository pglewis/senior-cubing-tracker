import clsx from "clsx";
import styles from "./pill.module.css";

interface PillProps {
	children: React.ReactNode;
	className?: string;
}

export function Pill({children, className}: PillProps) {
	return <span className={clsx(styles.pill, className)}>{children}</span>;
}
