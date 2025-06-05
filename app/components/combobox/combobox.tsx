import {useMemo, useRef, useState, type ChangeEvent} from "react";
import styles from "./combobox.module.css";

export interface ComboboxItem {
	value: string,
	label: string,
};

interface ComboboxProps {
	items: ComboboxItem[],
	placeholder?: string,
	onSelect: (item: ComboboxItem) => void,
	filterFn?: (item: ComboboxItem, searchTerm: string) => boolean,
};

export function Combobox({items, placeholder, onSelect, filterFn}: ComboboxProps) {
	const MAX_ITEMS = 10;
	const containerRef = useRef<HTMLDivElement>(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [highlightedIndex, setHighlightedIndex] = useState<number | undefined>(undefined);

	const filteredItems = useMemo(() => {
		if (searchTerm.length <= 2) {
			return [];
		}

		let filtered: ComboboxItem[];
		if (filterFn) {
			filtered = items.filter(item => filterFn(item, searchTerm));
		} else {
			filtered = items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
		}
		return filtered.slice(0, MAX_ITEMS);

	}, [items, searchTerm, filterFn]);

	const handleSelect = (item: ComboboxItem) => {
		setSearchTerm("");
		setIsOpen(false);
		setHighlightedIndex(undefined);
		onSelect(item);
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!isOpen) return;

		switch (e.key) {
			case "ArrowDown": {
				e.preventDefault();
				setHighlightedIndex(prev =>
					prev === undefined || prev >= filteredItems.length - 1 ? 0 : prev + 1
				);
				break;
			}
			case "ArrowUp": {
				e.preventDefault();
				setHighlightedIndex(prev =>
					prev === undefined || prev <= 0 ? filteredItems.length - 1 : prev - 1
				);
				break;
			}
			case "Enter": {
				e.preventDefault();
				if (highlightedIndex !== undefined) {
					handleSelect(filteredItems[highlightedIndex]);
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
		} else {
			setIsOpen(true);
		}
	};

	const handleBlur = (e: React.FocusEvent) => {
		// Ignore if any part of the component is receiving the focus (e.g. the list)
		if (e.relatedTarget && containerRef.current?.contains(e.relatedTarget as Node)) {
			return;
		}
		setIsOpen(false);
		setHighlightedIndex(undefined);
	};

	return (
		<div className={styles.container} ref={containerRef}>
			<input
				type="text"
				role="combobox"
				aria-autocomplete="list"
				aria-expanded={isOpen}
				aria-controls="search-listbox"
				aria-activedescendant={
					highlightedIndex !== undefined
						? `option-${filteredItems[highlightedIndex].value}`
						: undefined
				}
				placeholder={placeholder || ""}
				value={searchTerm}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				onBlur={handleBlur}
				autoComplete="off"
				spellCheck={false}
			/>
			{isOpen && filteredItems.length > 0 && (
				<ComboboxList
					items={filteredItems}
					highlightedIndex={highlightedIndex}
					onSelect={handleSelect}
					onHighlight={setHighlightedIndex}
				/>
			)}
		</div>
	);
}

interface ComboboxListProps {
	items: ComboboxItem[],
	highlightedIndex: number | undefined,
	onHighlight: (index: number | undefined) => void,
	onSelect: (item: ComboboxItem) => void,
}

function ComboboxList({items, highlightedIndex, onHighlight, onSelect}: ComboboxListProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault();
	};

	return (
		<ul
			id="search-listbox"
			role="listbox"
			className={styles.list}
			aria-label="Search results"
		>
			{items.map((item, index) => (
				<li
					id={`option-${item.value}`}
					key={item.value}
					role="option"
					aria-selected={index === highlightedIndex}
					onClick={() => onSelect(item)}
					onMouseDown={handleMouseDown}
					onMouseEnter={() => onHighlight(index)}
					className={index === highlightedIndex ? styles.highlighted : ""}
				>
					{item.label} ({item.value})
				</li>
			))}
		</ul>
	);
}