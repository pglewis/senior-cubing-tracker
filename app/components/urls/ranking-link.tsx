import type {EventRanking, WCAEventId} from "@repo/common/types/rankings-snapshot";
import {fromRegionParam} from "@repo/common/util/region-utils";

export interface RankingLinkProps {
	eventId: WCAEventId;
	eventType: EventRanking["type"];
	age: string;
	/** Prefixed region parameter (e.g. "world", "CNA" or "NNA") */
	region?: string;
	children: React.ReactNode;
	className?: string;
};

export function RankingLink({eventId, eventType, age, region = "world", children, className}: RankingLinkProps) {
	const baseRankingURL = "https://wca-seniors.org/Senior_Rankings.html";

	let regionParam = "";
	if (region !== "world") {
		const {id, isContinent} = fromRegionParam(region);
		regionParam = isContinent ? `-${id.toLowerCase()}` : `-xx-${id.toLowerCase()}`;
	}

	const rankingURL = `${baseRankingURL}#${eventId}-${eventType}-${age}${regionParam}`;

	return (
		<a className={className} href={rankingURL} target="_blank" rel="noopener noreferrer" >
			{children}
		</a>
	);
}