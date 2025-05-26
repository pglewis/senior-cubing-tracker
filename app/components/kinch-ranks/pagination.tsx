import styles from "./pagination.module.css";

interface PaginationProps {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
}

export function Pagination({currentPage, totalPages, onPageChange}: PaginationProps) {
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

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const pageNumber = parseInt(e.target.value, 10);
		if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
			onPageChange(pageNumber);
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
		pageButtons.push(
			<button
				key={page}
				className={`${styles.pageButton} ${page === currentPage ? styles.pageButtonActive : ""}`}
				onClick={() => onPageChange(page)}
			>
				{page}
			</button>
		);
	}

	return (
		<div className={styles.pageSelectorBox}>
			<button
				className={`${styles.pageButton} ${styles.previous}`}
				onClick={handlePrevious}
				disabled={currentPage === 1}
			>
				◀
			</button>
			{pageButtons}
			<button
				className={`${styles.pageButton} ${styles.next}`}
				onClick={handleNext}
				disabled={currentPage === totalPages}
			>
				▶
			</button>
			<span style={{marginLeft: ".5em"}}>
				page{" "}
				<input
					type="number"
					min={1}
					max={totalPages}
					value={currentPage}
					onChange={handleInputChange}
				/>
				{" "}of {totalPages}
			</span>
		</div>
	);
}