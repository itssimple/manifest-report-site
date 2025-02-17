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

	console.log("startPage", startPage);
	console.log("endPage", endPage);
	console.log("currentPage", currentPage);

	return (
		<div className="flex gap-4 items-center justify-center">
			{currentPage > 1 && (
				<Link href={`${pagingLinkPrefix}/1`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">First</Link>
			)}
			{currentPage > 1 && (
				<Link href={`${pagingLinkPrefix}/${currentPage - 1}`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Previous</Link>
			)}
			{Array.from({ length: totalPages }, (_, i) => i + 1).filter((page) => page >= startPage && page <= endPage).map((page) => (
				<Link key={page} href={`${pagingLinkPrefix}/${page}`} className={`text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4 ${page === currentPage ? "bg-blue-500" : ""}`}>{page}</Link>
			))}
			{currentPage < totalPages && (
				<Link href={`${pagingLinkPrefix}/${currentPage + 1}`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Next</Link>
			)}
			{currentPage < totalPages && (
				<Link href={`${pagingLinkPrefix}/${totalPages}`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Last</Link>
			)}
		</div>
	);

	// return (
	// 	<div className="flex gap-4 items-center justify-center">
	// 		{currentPage > 1 && (
	// 			<Link href={`${pagingLinkPrefix}/${currentPage - 1}`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Previous</Link>
	// 		)}
	// 		{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
	// 			<Link key={page} href={`${pagingLinkPrefix}/${page}`} className={`text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4 ${page === currentPage ? "bg-blue-900" : ""}`}>{page}</Link>
	// 		))}
	// 		{currentPage < totalPages && (
	// 			<Link href={`${pagingLinkPrefix}/${currentPage + 1}`} className="text-white bg-blue-800 ring-4 rounded-lg pl-4 pr-4">Next</Link>
	// 		)}
	// 	</div>
	// );
}