import clsx from "clsx";
import styles from "./button-tabs.module.css";

export interface ButtonTabOption {
	value: string,
	label: string,
};

interface ButtonTabsProps {
	options: ButtonTabOption[],
	selectedValue: string,
	onChange: (value: string) => void,
}
export function ButtonTabs({options, selectedValue, onChange}: ButtonTabsProps) {
	return (
		<div className={styles.buttonTabGroup}>
			{options.map((option) => (
				<button
					key={option.value}
					className={clsx(
						styles.buttonTab,
						(selectedValue === option.value) && styles.active
					)}
					onClick={() => onChange(option.value)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}