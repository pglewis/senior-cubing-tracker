import React from "react";
import styles from "./card.module.css";

interface CardProps {
	children: React.ReactNode;
	className?: string;
	textAlign?: "left" | "center" | "right";
}

export function Card({children, className = "", textAlign = "left"}: CardProps) {
	const alignmentClass = textAlign !== "left" ? styles[textAlign] : "";

	return (
		<div className={`${styles.card} ${alignmentClass} ${className}`}>
			{children}
		</div>
	);
}
