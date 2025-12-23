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
	const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
		if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
			e.preventDefault();
			const nextIndex = e.key === "ArrowRight"
				? (index + 1) % options.length
				: (index - 1 + options.length) % options.length;

			const nextButton = e.currentTarget.parentElement?.children[nextIndex] as HTMLButtonElement;
			nextButton?.focus();
		}
	};

	return (
		<div className={styles["button-tab-group"]} role="tablist" aria-label="Content tabs">
			{options.map((option, index) => (
				<button
					key={option.value}
					className={clsx(
						styles["button-tab"],
						(selectedValue === option.value) && styles.active
					)}
					role="tab"
					aria-selected={selectedValue === option.value}
					tabIndex={selectedValue === option.value ? 0 : -1}
					onClick={() => onChange(option.value)}
					onKeyDown={(e) => handleKeyDown(e, index)}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}