import Link from "next/link";

export function Pager({ currentPage, totalPages, pagingLinkPrefix }: { currentPage: number, totalPages: number, pagingLinkPrefix: string }) {
	// If there's only one page, don't show the pager
	if (totalPages === 1) {
		return null;
	}

	if (typeof currentPage !== "number") {
		currentPage = parseInt(currentPage);
	}

	// Only show 5 pages at a time

	let startPage = currentPage - 2;
	let endPage = currentPage + 2;

	if (startPage < 1) {
		endPage += 1 - startPage;
		startPage = 1;
	}

	if (endPage > totalPages) {
		startPage -= endPage - totalPages;
		endPage = totalPages;
	}

	if (startPage < 1) {
		startPage = 1;
	}

	const buttonClasses = "text-white bg-blue-800 ring-4 pl-1 pr-1 rounded-lg md:pl-4 md:pr-4";

	return (
		<div className="flex gap-3 md:gap-5 items-center justify-center text-xs md:text-base">
			{currentPage > 1 && (
				<Link href={`${pagingLinkPrefix}/1`} className={buttonClasses}>First</Link>
			)}
			{currentPage > 1 && (
				<Link href={`${pagingLinkPrefix}/${currentPage - 1}`} className={buttonClasses}>Previous</Link>
			)}
			{Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => page >= startPage && page <= endPage).map((page) => (
				<Link key={page} href={`${pagingLinkPrefix}/${page}`} className={`${buttonClasses} ${page === currentPage ? "bg-blue-500" : ""}`}>{page}</Link>
			))}
			{currentPage < totalPages && (
				<Link href={`${pagingLinkPrefix}/${currentPage + 1}`}  className={buttonClasses}>Next</Link>
			)}
			{currentPage < totalPages && (
				<Link href={`${pagingLinkPrefix}/${totalPages}`}  className={buttonClasses}>Last</Link>
			)}
		</div>
	);
}