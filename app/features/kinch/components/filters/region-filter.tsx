import type {Continent, Country} from "@repo/common/types/rankings-snapshot";
import {toRegionParam} from "@repo/common/util/kinch-region-utils";

interface RegionFilterProps {
	value: string;
	onChange: (value: string) => void;
	continents: Continent[];
	countries: Country[];
}

export function RegionFilter({value, onChange, continents, countries}: RegionFilterProps) {
	return (
		<div>
			<select
				value={value}
				onChange={e => onChange(e.target.value)}
			>
				<option value="world">World</option>

				<optgroup label="Continents">
					{continents.map(continent => (
						<option
							key={continent.id}
							value={toRegionParam(continent.id, true)}
						>
							{continent.name}
						</option>
					))}
				</optgroup>

				<optgroup label="Countries">
					{countries
						.sort((a, b) => a.name.localeCompare(b.name))
						.map(country => (
							<option
								key={country.id}
								value={toRegionParam(country.id, false)}
							>
								{country.name}
							</option>
						))}
				</optgroup>
			</select>
		</div>
	);
}