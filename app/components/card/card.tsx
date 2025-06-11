import React from "react";
import styles from "./card.module.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	textAlign?: "left" | "center" | "right";
	role?: string;
	ariaLabel?: string;
	ariaLabelledby?: string;
}

export function Card({
	children,
	className = "",
	textAlign = "left",
	role,
	ariaLabel,
	ariaLabelledby
}: CardProps) {
	const alignmentClass = textAlign !== "left" ? styles[textAlign] : "";

	return (
		<div
			className={`${styles.card} ${alignmentClass} ${className}`}
			role={role}
			aria-label={ariaLabel}
			aria-labelledby={ariaLabelledby}
		>
			{children}
		</div>
	);
}