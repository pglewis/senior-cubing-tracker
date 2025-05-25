import type {ChangeEvent} from "react";
import {SearchResults} from "./search-results";
import {useSearchBox} from "./use-search-box";
import styles from "./search-box.module.css";
import {useCallback, useState} from "react";
import type {KinchRank} from "@repo/common/types/kinch-types";

interface SearchBoxProps {
	value: string;
	onSelect: (value: string) => void;
	age: string;
	region: string;
}

export function SearchBox({value, onSelect, age, region}: SearchBoxProps) {
	const {
		searchTerm,
		filteredResults,
		setSearchTerm,
		filterResults
	} = useSearchBox({value, age, region});

	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState(-1);

	const handleSelect = useCallback((result: KinchRank) => {
		setSearchTerm(result.personID);
		onSelect(result.personID);
		setIsOpen(false);
		setHighlightedIndex(-1);
	}, [onSelect, setSearchTerm]);

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
					prev < filteredResults.length - 1 ? prev + 1 : 0
				);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				setHighlightedIndex(prev =>
					prev > 0 ? prev - 1 : filteredResults.length - 1
				);
				break;
			}
			case "Enter": {
				e.preventDefault();
				if (highlightedIndex >= 0) {
					handleSelect(filteredResults[highlightedIndex]);
				}
				break;
			}
			case "Escape": {
				e.preventDefault();
				setIsOpen(false);
				setHighlightedIndex(-1);
				break;
			}
			case "Home": {
				e.preventDefault();
				setHighlightedIndex(0);
				break;
			}
			case "End": {
				e.preventDefault();
				setHighlightedIndex(filteredResults.length - 1);
				break;
			}
			case "PageUp": {
				e.preventDefault();
				setHighlightedIndex(0);
				break;
			}
			case "PageDown": {
				e.preventDefault();
				setHighlightedIndex(filteredResults.length - 1);
				break;
			}
		}
	};

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchTerm(newValue);
		setHighlightedIndex(-1);
		if (!newValue) {
			onSelect("");
			setIsOpen(false);
		} else {
			setIsOpen(true);
			filterResults(newValue);
		}
	};

	const handleBlur = (e: React.FocusEvent) => {
		if (e.relatedTarget && (e.relatedTarget as HTMLElement).closest(`.${styles.results}`)) {
			return;
		}
		setIsOpen(false);
		setHighlightedIndex(-1);
	};

	return (
		<div className={styles.container}>
			<input
				type="text"
				role="combobox"
				aria-expanded={isOpen}
				aria-controls="search-listbox"
				aria-activedescendant={
					highlightedIndex >= 0
						? `option-${filteredResults[highlightedIndex].personID}`
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
			{isOpen && filteredResults.length > 0 && (
				<SearchResults
					results={filteredResults}
					highlightedIndex={highlightedIndex}
					onSelect={handleSelect}
					onHighlight={setHighlightedIndex}
				/>
			)}
		</div>
	);
}