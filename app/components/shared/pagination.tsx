import {useEffect, useState} from "react";
import clsx from "clsx";
import styles from "./pagination.module.css";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({currentPage, totalPages, onPageChange}: PaginationProps) {
	const [inputValue, setInputValue] = useState(String(currentPage));

	// Update input value when currentPage prop changes
	useEffect(() => {
		setInputValue(String(currentPage));
	}, [currentPage]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(e.target.value);
	};

	const handleInputBlur = () => {
		const pageNumber = parseInt(inputValue.trim(), 10);
		if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
			onPageChange(pageNumber);
		} else {
			// Reset to current page if invalid
			setInputValue(String(currentPage));
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			handleInputBlur();
		}
	};

	const handlePrevious = () => {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	};

	// Determine start and end page buttons
	const maxButtons = 5;
	let startPage = 1;
	let endPage = totalPages;

	if (totalPages > maxButtons) {
		if (currentPage <= 3) {
			startPage = 1;
			endPage = 5;
		} else if (currentPage >= totalPages - 2) {
			startPage = totalPages - 4;
			endPage = totalPages;
		} else {
			startPage = currentPage - 2;
			endPage = currentPage + 2;
		}
	}

	// Generate page buttons
	const pageButtons = [];
	for (let page = startPage; page <= endPage; page++) {
		const className = clsx(
			styles.pageButton,
			(page === currentPage) && styles.pageButtonActive
		);

		pageButtons.push(
			<button key={page} className={className} onClick={() => onPageChange(page)}>
				{page}
			</button>
		);
	}

	return (
		<div className={clsx(styles.pageSelector, styles.container)}>
			<button
				className={clsx(styles.pageButton, styles.previous)}
				onClick={handlePrevious}
				disabled={currentPage === 1}
			>
				◀
			</button>
			{pageButtons}
			<button
				className={clsx(styles.pageButton, styles.next)}
				onClick={handleNext}
				disabled={currentPage === totalPages}
			>
				▶
			</button>
			<span className={styles.pageOf}>
				page{" "}
				<input
					type="text"
					inputMode="numeric"
					pattern="[0-9]*"
					value={inputValue}
					onChange={handleInputChange}
					onBlur={handleInputBlur}
					onKeyDown={handleKeyDown}
				/>
				{" "}of {totalPages}
			</span>
		</div>
	);
};
