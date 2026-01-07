import {Card} from "@repo/app/components/card/card";
import styles from "./loading-card.module.css";

interface LoadingCardProps {
	message?: string;
}

export function LoadingCard({
	message = "Loading rankings…",
}: LoadingCardProps) {
	return (
		<div className={styles["loading-container"]}>
			<div className={styles["content-width"]}>
				<Card textAlign="center" role="status" ariaLabel={message}>
					<div className={styles["spinner"]} aria-hidden="true" />
					<div className={styles.message}>{message}</div>
					<span className="sr-only">{message}</span>
				</Card>
			</div>
		</div>
	);
}
