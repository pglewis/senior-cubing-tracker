import clsx from "clsx";
import styles from "./country-flag.module.css";

const getFlagEmoji = (countryCode: string): string => {
	if (!countryCode || countryCode.length !== 2) return "";

	return countryCode
		.toUpperCase()
		.replace(/./g, char =>
			String.fromCodePoint(127397 + char.charCodeAt(0))
		);
};

interface CountryFlagProps {
	countryCode: string;
	size?: "small" | "medium" | "large";
	className?: string;
	title?: string;
}

export function CountryFlag({countryCode, size = "medium", className = "", title}: CountryFlagProps) {
	const flagEmoji = getFlagEmoji(countryCode);

	if (!flagEmoji) return null;

	return (
		<span
			className={clsx(styles.countryFlag, styles[size], className)}
			title={title || countryCode}
		>
			{flagEmoji}
		</span>
	);
}