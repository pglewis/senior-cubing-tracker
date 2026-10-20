import {Card} from "@repo/app/components/card/card";
import styles from "./page-header-card.module.css";

interface PageHeaderCardProps {
	title: string;
	subtitle?: string;
	description: string;
}

/** Centered card introducing a page's content, e.g. which region and age it covers */
export function PageHeaderCard({title, subtitle, description}: PageHeaderCardProps) {
	return (
		<Card className={styles["header-card"]}>
			<h3 className={styles.title}>{title}</h3>
			{subtitle && <div className={styles.subtitle}>{subtitle}</div>}
			<p className={styles.description}>{description}</p>
		</Card>
	);
}
