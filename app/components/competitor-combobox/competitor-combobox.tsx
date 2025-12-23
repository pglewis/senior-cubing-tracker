import {Combobox, type ComboboxItem} from "../combobox/combobox";

interface CompetitorComboboxProps {
	items: ComboboxItem[];
	onSelect: (item: ComboboxItem) => void;
	placeholder?: string;
}

export function CompetitorCombobox({items, onSelect, placeholder}: CompetitorComboboxProps) {
	const filterCompetitor = (item: ComboboxItem, searchTerm: string) => {
		return [item.label, item.value].some(field =>
			field.toLowerCase().includes(searchTerm.toLowerCase())
		);
	};

	return (
		<Combobox
			items={items}
			placeholder={placeholder || "Search by name or WCA ID..."}
			onSelect={onSelect}
			filterFn={filterCompetitor}
		/>
	);
}
