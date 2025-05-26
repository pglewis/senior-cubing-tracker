import type {KinchRank} from "@repo/common/types/kinch-types";
import styles from "./search-box.module.css";

interface PersonResultsListProps {
	results: KinchRank[];
	highlightedIndex: number | undefined;
	onSelect: (result: KinchRank) => void;
	onHighlight: (index: number | undefined) => void;
}

export function PersonResultsList({
	results,
	highlightedIndex,
	onSelect,
	onHighlight
}: PersonResultsListProps) {
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