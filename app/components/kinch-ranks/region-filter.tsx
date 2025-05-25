import type {ChangeEvent} from 'react';
import type {Continent, Country} from '@repo/common/types/rankings-snapshot';

interface RegionFilterProps {
    value: string;
    onChange: (value: string) => void;
    continents: Continent[];
    countries: Country[];
}

export function RegionFilter({value, onChange, continents, countries}: RegionFilterProps) {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange(e.target.value);
    };

    return (
        <div>
            <select value={value} onChange={handleChange}>
                <option value="world">World</option>

                <optgroup label="Continents">
                    {continents.map(continent => (
                        <option key={continent.id} value={continent.id}>
                            {continent.name}
                        </option>
                    ))}
                </optgroup>

                <optgroup label="Countries">
                    {countries
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map(country => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                </optgroup>
            </select>
        </div>
    );
}