import type {ChangeEvent} from "react";
import {PersonResultsList} from "./person-results-list";
import {useKinchPersonSearch} from "../../hooks/use-kinch-person-search";
import styles from "./search-box.module.css";
import {useCallback, useState, useEffect} from "react";
import type {KinchRank} from "@repo/common/types/kinch-types";
import {debounce} from "@repo/common/util/debounce";

interface SearchBoxProps {
	value: string;
	onSelect: (value: string) => void;
	age: string;
	region: string;
}

const debouncedFilterResults = debounce(
	(filterFn: (term: string) => KinchRank[], term: string, callback: (results: KinchRank[]) => void) => {
		callback(filterFn(term));
	});

export function PersonSearch({value, onSelect, age, region}: SearchBoxProps) {
	const {filterResults} = useKinchPersonSearch({age, region});
	const [searchTerm, setSearchTerm] = useState(value);
	const [results, setResults] = useState<KinchRank[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);

	useEffect(() => {
		setSearchTerm(value);
	}, [value]);

	const handleSelect = useCallback((result: KinchRank) => {
		setSearchTerm(result.personID);
		onSelect(result.personID);
		setIsOpen(false);
		setHighlightedIndex(undefined);
	}, [onSelect]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen && e.key === "Enter" && !searchTerm) {
			e.preventDefault();
			onSelect("");
			return;
		}

		if (!isOpen) return;

		switch (e.key) {
			case "ArrowDown": {
				e.preventDefault();
				setHighlightedIndex(prev =>
					prev === undefined || prev >= results.length - 1 ? 0 : prev + 1
				);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				setHighlightedIndex(prev =>
					prev === undefined || prev <= 0 ? results.length - 1 : prev - 1
				);
				break;
			}
			case "Enter": {
				e.preventDefault();
				if (highlightedIndex !== undefined) {
					handleSelect(results[highlightedIndex]);
				}
				break;
			}
			case "Escape": {
				e.preventDefault();
				setIsOpen(false);
				setHighlightedIndex(undefined);
				break;
			}
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchTerm(newValue);
		setHighlightedIndex(undefined);
		if (!newValue) {
			onSelect("");
			setIsOpen(false);
			setResults([]);
		} else {
			setIsOpen(true);
			debouncedFilterResults(filterResults, newValue, setResults);
		}
	};

	const handleBlur = (e: React.FocusEvent) => {
		if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest(`.${styles.results}`)) {
			return;
		}
		setIsOpen(false);
		setHighlightedIndex(undefined);
	};

	return (
		<div className={styles.container}>
			<input
				type="text"
				role="combobox"
				aria-expanded={isOpen}
				aria-controls="search-listbox"
				aria-activedescendant={
					highlightedIndex !== undefined
						? `option-${results[highlightedIndex].personID}`
						: undefined
				}
				placeholder="Search name or WCA ID"
				value={searchTerm}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				autoComplete="off"
				spellCheck={false}
			/>
			{isOpen && results.length > 0 && (
				<PersonResultsList
					results={results}
					highlightedIndex={highlightedIndex}
					onSelect={handleSelect}
					onHighlight={setHighlightedIndex}
				/>
			)}
		</div>
	);
}