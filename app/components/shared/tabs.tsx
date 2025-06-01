import {type ReactNode} from "react";
import styles from "./tabs.module.css";

interface TabOption {
	label: string,
	value: string,
};

interface AgeGroupTabsProps {
	options: TabOption[],
	selectedValue: string,
	onValueChange: (value: string) => void,
	children: ReactNode,
};

export function Tabs({options, selectedValue, onValueChange, children}: AgeGroupTabsProps) {
	return (
		<div className={styles.container}>
			<div className={styles.tabs}>
				{options.map((option) => (
					<button
						key={option.value}
						className={`${styles.tab} ${selectedValue === option.value ? styles.active : ""}`}
						onClick={() => onValueChange(option.value)}
						type="button"
					>
						{option.label}
					</button>
				))}
			</div>
			<div className={styles.content}>
				{children}
			</div>
		</div>
	);
}