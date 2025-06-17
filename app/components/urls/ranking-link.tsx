import type {EventRanking, WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {RegionInfo} from "@repo/app/features/kinch/context/kinch-context";

export interface RankingLinkProps {
	eventId: WCAEventId;
	eventType: EventRanking["type"];
	age: string;
	regionInfo?: RegionInfo;
	children: React.ReactNode;
	className?: string;
};

export function RankingLink({eventId, eventType, age, regionInfo, children, className}: RankingLinkProps) {
	const baseRankingURL = "https://wca-seniors.org/Senior_Rankings.html";

	let regionParam = "";
	if (regionInfo && regionInfo.type === "continent") {
		regionParam = `-${regionInfo.id.toLowerCase()}`;
	} else if (regionInfo && regionInfo.type === "country") {
		regionParam = `-xx-${regionInfo.id.toLowerCase()}`;
	}

	const rankingURL = `${baseRankingURL}#${eventId}-${eventType}-${age}${regionParam}`;

	return (
		<a className={className} href={rankingURL} target="_blank" rel="noopener noreferrer" >
			{children}
		</a>
	);
}