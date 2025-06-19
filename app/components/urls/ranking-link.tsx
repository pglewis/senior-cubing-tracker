import type {EventRanking, WCAEventId} from "@repo/common/types/rankings-snapshot";
import type {RegionInfo} from "@repo/app/features/kinch/context/kinch-context";

export interface RankingLinkProps {
	eventId: WCAEventId;
	eventType: EventRanking["type"];
	age: string;
	region?: {
		type: RegionInfo["type"];
		id: RegionInfo["id"];
	};
	children: React.ReactNode;
	className?: string;
};

export function RankingLink({eventId, eventType, age, region, children, className}: RankingLinkProps) {
	const baseRankingURL = "https://wca-seniors.org/Senior_Rankings.html";

	let regionParam = "";
	if (region && region.type === "continent") {
		regionParam = `-${region.id.toLowerCase()}`;
	} else if (region && region.type === "country") {
		regionParam = `-xx-${region.id.toLowerCase()}`;
	}

	const rankingURL = `${baseRankingURL}#${eventId}-${eventType}-${age}${regionParam}`;

	return (
		<a className={className} href={rankingURL} target="_blank" rel="noopener noreferrer" >
			{children}
		</a>
	);
}