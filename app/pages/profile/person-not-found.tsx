import {Card} from "@repo/app/components/card/card";
import styles from "./profile.module.css";

export function PersonNotFound() {
	return (
		<Card className={styles["not-found-card"]}>
			<div>Person not found</div>
		</Card>
	);
}
