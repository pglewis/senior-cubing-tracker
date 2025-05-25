import type {Continent, Country, ExtendedRankingsData} from '@repo/common/types/rankings-snapshot';
import type {TopRank} from '@repo/common/types/kinch-types';

interface FilteredRegions {
    continents: Continent[];
    countries: Country[];
}

export function getFilteredRegions(
    rankings: ExtendedRankingsData,
    wcaId: string | undefined,
    age: string,
    topRanks: TopRank[]
): FilteredRegions {
    const {continents, countries} = rankings.data;

    if (wcaId) {
        const person = rankings.data.persons[rankings.personIDToIndex[wcaId]];
        const country = rankings.data.countries[rankings.countryIDToIndex[person.country]];
        const continent = continents.find(c => c.id === country.continent);

        return {
            continents: continent ? [continent] : [],
            countries: [country]
        };
    }

    return {
        continents: continents.filter(c =>
            topRanks.some(tr => tr.age === Number(age) && tr.region === c.id)
        ),
        countries: countries.filter(c =>
            topRanks.some(tr => tr.age === Number(age) && tr.region === c.id)
        )
    };
}