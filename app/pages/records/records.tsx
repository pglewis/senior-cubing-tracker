import {useSearchParams} from "react-router";
import {useData} from "@repo/app/hooks/use-data";
import {useRecords} from "@repo/app/features/records/hooks/use-records";
import {buildProfilePersonRoute} from "@repo/app/routing/routes";
import {Card} from "@repo/app/components/card/card";
import {ButtonTabs} from "@repo/app/components/button-tabs/button-tabs";
import {DataLastUpdated} from "@repo/app/components/data-last-updated/data-last-updated";
import {EventCardList, RecordCard} from "@repo/app/components/event-card/event-card";
import {FilterBar, FilterItem} from "@repo/app/components/filter-bar/filter-bar";
import {PageContainer} from "@repo/app/components/page-container/page-container";
import {PageHeaderCard} from "@repo/app/components/page-header-card/page-header-card";
import {RegionFilter} from "@repo/app/components/region-filter/region-filter";
import {getRegionName} from "@repo/common/util/region-utils";

const defaults = {
	age: "40",
	region: "world",
} as const;

export function Records() {
	const {rankings} = useData();
	const [searchParams, setSearchParams] = useSearchParams();
	const age = searchParams.get("age") || defaults.age;
	const region = searchParams.get("region") || defaults.region;
	const {records, ageOptions, continents, countries} = useRecords({age, region});
	const regionName = getRegionName(rankings, region);

	// Default values are left out of the URL
	const setParam = (key: keyof typeof defaults, value: string) => {
		setSearchParams(prev => {
			const params = new URLSearchParams(prev);
			if (value === defaults[key]) {
				params.delete(key);
			} else {
				params.set(key, value);
			}
			return params;
		}, {preventScrollReset: true});
	};

	return (
		<PageContainer>
			<h2>Senior Event Records</h2>

			<DataLastUpdated text={rankings.lastUpdated} />

			<FilterBar>
				<FilterItem>
					<RegionFilter
						value={region}
						onChange={value => setParam("region", value)}
						continents={continents}
						countries={countries}
					/>
				</FilterItem>
				<FilterItem>
					<ButtonTabs
						selectedValue={age}
						onChange={value => setParam("age", value)}
						options={ageOptions}
					/>
				</FilterItem>
			</FilterBar>

			{records.length === 0 ? (
				<Card textAlign="center">
					No results found for the selected age and region.
				</Card>
			) : (
				<>
					<PageHeaderCard
						title={`${regionName}, ${age}+`}
						description="The best single and average in each event among registered senior competitors."
					/>

					<EventCardList>
						{records.map(event => (
							<RecordCard
								key={event.eventId}
								event={event}
								title={`${event.eventName} (${regionName}, ${age}+)`}
								age={age}
								region={region}
								getPersonUrl={personId => `${buildProfilePersonRoute(personId)}?age=${age}`}
							/>
						))}
					</EventCardList>
				</>
			)}
		</PageContainer>
	);
}
