import {useState, useCallback} from 'react';
import type {ChangeEvent} from 'react';
import {useKinchRanks} from '@repo/app/hooks/use-kinch-ranks';
import {debounce} from '@repo/common/util/debounce';
import type {KinchRank} from '@repo/common/types/kinch-types';
import styles from './search-box.module.css';

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    age: string;
    region: string;
}

export function SearchBox({value, onChange, age, region}: SearchBoxProps) {
    const kinchRanks = useKinchRanks({age, region});
    const [showDropdown, setShowDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value);
    const [filteredResults, setFilteredResults] = useState<KinchRank[]>([]);

    const filterResults = useCallback((term: string) => {
        if (term.length <= 2) {
            setFilteredResults([]);
            setShowDropdown(false);
            return;
        }

        const lowerTerm = term.toLowerCase();
        const results = kinchRanks
            .filter(rank =>
                rank.personID.toLowerCase().includes(lowerTerm) ||
                rank.personName.toLowerCase().includes(lowerTerm)
            )
            .slice(0, 10);

        setFilteredResults(results);
        setShowDropdown(results.length > 0);
    }, [kinchRanks]);

    const debouncedFilter = debounce(filterResults, 350);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
        debouncedFilter(newValue);
    };

    const handleSelect = (result: KinchRank) => {
        onChange(result.personID);
        setShowDropdown(false);
        setSearchTerm(result.personID);
    };

    return (
        <div className={styles.container}>
            <input
                type="text"
                placeholder="Search name or WCA ID"
                value={searchTerm}
                onChange={handleChange}
                autoComplete="off"
                spellCheck={false}
            />
            {showDropdown && (
                <ul className={styles.results}>
                    {filteredResults.map(result => (
                        <li
                            key={result.personID}
                            onClick={() => handleSelect(result)}
                        >
                            {result.personName} ({result.personID})
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}