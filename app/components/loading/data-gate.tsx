import {Link} from "react-router";
import {useDataOptional} from "@repo/app/hooks/use-data";
import {ROUTES} from "@repo/app/routing/routes";
import {Card} from "@repo/app/components/card/card";
import {LoadingCard} from "@repo/app/components/loading/loading-card";
import styles from "./data-gate.module.css";

export function DataGate({children}: {children: React.ReactNode;}) {
	const context = useDataOptional();
	const hasData = Boolean(context.rankings && context.topRanks);

	if (hasData) {
		return children;
	}

	if (context.status === "loading") {
		return <LoadingCard />;
	}

	const isOffline = typeof navigator !== "undefined" && navigator.onLine === false;
	const message = isOffline
		? "You appear to be offline, and rankings data is not available yet."
		: "Rankings data is not available yet.";

	return (
		<div className={styles.container}>
			<div className={styles["content-width"]}>
				<Card textAlign="center">
					<h2 className={styles.heading}>Rankings unavailable</h2>
					<p className={styles.message}>{message}</p>
					{context.error && (
						<p className={styles.details}>
							{context.error.message}
						</p>
					)}
					<Link to={ROUTES.HOME} className={styles.link}>
						Go to Home
					</Link>
				</Card>
			</div>
		</div>
	);
}
