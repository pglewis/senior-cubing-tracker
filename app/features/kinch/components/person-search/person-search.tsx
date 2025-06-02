import {useCallback, useState, type ChangeEvent} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import type {KinchRank} from "@repo/common/types/kinch-types";
import {debounce} from "@repo/common/util/debounce";
import {useKinchPersonSearch} from "@repo/app/features/kinch/hooks/use-kinch-person-search";
import styles from "./person-search.module.css";

const debouncedFilterResults = debounce(
	(filterFn: (term: string) => KinchRank[], term: string, callback: (results: KinchRank[]) => void) => {
		callback(filterFn(term));
	});

interface PersonSearchProps {
	age: string;
	region: string;
}

export function PersonSearch({age, region}: PersonSearchProps) {
	const {filterResults} = useKinchPersonSearch({age, region});
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState<KinchRank[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);
	const navigate = useNavigate();
	const location = useLocation();

	const handleSelect = useCallback((result: KinchRank) => {
		setSearchTerm("");

		// Build the return URL with current params
		const currentUrl = `${location.pathname}${location.search}`;

		// Navigate with state instead of using onSelect
		navigate(`/kinch-ranks?wcaid=${result.personID}&age=${age}&region=world`, {
			state: {from: currentUrl}
		});

		setIsOpen(false);
		setHighlightedIndex(undefined);
	}, [navigate, location, age]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
				<PersonSearchList
					results={results}
					highlightedIndex={highlightedIndex}
					onSelect={handleSelect}
					onHighlight={setHighlightedIndex}
				/>
			)}
		</div>
	);
}

interface PersonResultsListProps {
	results: KinchRank[];
	highlightedIndex: number | undefined;
	onSelect: (result: KinchRank) => void;
	onHighlight: (index: number | undefined) => void;
}

function PersonSearchList({results, highlightedIndex, onSelect, onHighlight}: PersonResultsListProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
	};

	return (
		<ul
			id="search-listbox"
			role="listbox"
			className={styles.results}
			aria-label="Search results"
		>
			{results.map((kinchRank, index) => (
				<li
					id={`option-${kinchRank.personID}`}
					key={kinchRank.personID}
					role="option"
					aria-selected={index === highlightedIndex}
					onClick={() => onSelect(kinchRank)}
					onMouseDown={handleMouseDown}
					onMouseEnter={() => onHighlight(index)}
					className={index === highlightedIndex ? styles.highlighted : ""}
				>
					{kinchRank.personName} ({kinchRank.personID})
				</li>
			))}
		</ul>
	);
}