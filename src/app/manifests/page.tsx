import { ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";
import { displayDiffTable } from "../shared-methods";
import { Pager } from "../components/Pager";

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

export const metadata: Metadata = {
  title: "Manifest list - Manifest.report",
	description: "Find the changes you're looking for.",
	openGraph: {
		title: "Manifest list - Manifest.report",
		description: "Find the changes you're looking for.",
		url: "https://site.manifest.report/manifests",
	}
};

const manifestListObject = await s3.send(getManifestList);

const manifestList = JSON.parse(await manifestListObject.Body!.transformToString());

const ITEMS_PER_PAGE = 10;

manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
	return new Date(b.DiscoverDate_UTC).getTime() - new Date(a.DiscoverDate_UTC).getTime();
});

const manifestListItems = manifestList.slice(0, ITEMS_PER_PAGE);
const currentPage = 1;
const totalPages = Math.ceil(manifestList.length / ITEMS_PER_PAGE);

export default async function Page() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center p-8 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-start">
				<h2 className="text-4xl">Manifest list: {manifestList.length} manifests stored</h2>
				<hr />
				{manifestListItems.map((manifest : ManifestListItem) => (
					displayDiffTable(manifest)
				))}
				{totalPages > 1 && (<Pager currentPage={currentPage} totalPages={totalPages} pagingLinkPrefix={"/manifests/p"} />)}
			</main>
		</div>
	)
}