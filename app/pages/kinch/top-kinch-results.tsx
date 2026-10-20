import {useData} from "@repo/app/hooks/use-data";
import {useKinchContext} from "@repo/app/features/kinch/hooks/use-kinch-context";
import {useTopKinchResults} from "@repo/app/features/kinch/hooks/use-top-kinch-results";
import {KinchLayout} from "@repo/app/features/kinch/components/layout/kinch-layout";
import {PageHeaderCard} from "@repo/app/components/page-header-card/page-header-card";
import {EventCardList, RecordCard} from "@repo/app/components/event-card/event-card";
import {buildKinchPersonRoute} from "@repo/app/routing/routes";
import {getRegionName} from "@repo/common/util/region-utils";

export function TopKinchResults() {
	const {rankings} = useData();
	const {age, region, ageOptions} = useKinchContext();
	const results = useTopKinchResults({age, region});

	if (results.length === 0) {
		return (
			<KinchLayout availableAgeOptions={ageOptions}>
				<div>
					<h3>Top Kinch Results</h3>
					<p>No results found for the selected age and region.</p>
				</div>
			</KinchLayout>
		);
	}

	const regionName = getRegionName(rankings, region);

	return (
		<KinchLayout availableAgeOptions={ageOptions}>
			<PageHeaderCard
				title="Top Kinch Results"
				subtitle={`${regionName}, ${age}+`}
				description="These are the best results for each event used as benchmarks for Kinch scoring."
			/>

			<EventCardList>
				{results.map((event) => (
					<RecordCard
						key={event.eventId}
						event={event}
						title={`${event.eventName} (${regionName}, ${age}+)`}
						age={age}
						region={region}
						getPersonUrl={personId => `${buildKinchPersonRoute(personId)}?age=${age}&region=${region}`}
					/>
				))}
			</EventCardList>
		</KinchLayout>
	);
}
