import { Pager } from "@/components/Pager";
import { displayDiffTable } from "@/app/shared-methods";
import { ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";

const s3 = new S3Client({
	region: "manifest-report",
	credentials: {
		accessKeyId: process.env.S3ACCESSKEY!,
		secretAccessKey: process.env.S3SECRETKEY!
	},
	endpoint: process.env.S3ENDPOINT!,
	forcePathStyle: true
}
);

const getManifestList = new GetObjectCommand({
	Bucket: "manifest-archive",
	Key: "list.json",
});

const manifestListObject = await s3.send(getManifestList);

const manifestList = JSON.parse(await manifestListObject.Body!.transformToString());

manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
	return new Date(b.DiscoverDate_UTC).getTime() - new Date(a.DiscoverDate_UTC).getTime();
});

const ITEMS_PER_PAGE = 10;

export const metadata: Metadata = {
  title: "Manifest list - Manifest.report",
	description: "Find the changes you're looking for.",
	openGraph: {
		title: "Manifest list - Manifest.report",
		description: "Find the changes you're looking for.",
		url: "https://site.manifest.report/manifests",
	}
};

export async function generateStaticParams() {
	// Generate static pages for each page of the manifest list
	return Array.from({ length: Math.ceil(manifestList.length / ITEMS_PER_PAGE) + 1 }, (_, i) => ({
		page: i.toString(),
	}));
}

export default async function Page({
	params,
}: {
	params: Promise<{ page: number }>;
	}) {
	const {page} = await params;

	const currentPage = page;
	const totalPages = Math.ceil(manifestList.length / ITEMS_PER_PAGE);
	const manifestListItems = manifestList.slice(ITEMS_PER_PAGE * (currentPage - 1), ITEMS_PER_PAGE * currentPage);

	return (
			<main className="flex flex-col gap-4 row-start-2 items-start">
			<h2 className="text-4xl">Manifest list: {manifestList.length} manifests stored - Page {page}</h2>
				<hr />
				{manifestListItems.map((manifest : ManifestListItem) => (
					displayDiffTable(manifest)
				))}
				{totalPages > 1 && (<Pager currentPage={currentPage} totalPages={totalPages} pagingLinkPrefix={"/manifests/p"} />)}
			</main>
	)
}