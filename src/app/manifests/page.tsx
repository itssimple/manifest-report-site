import { ManifestListItem } from "@/types/manifestListTypes";
import { Metadata } from "next";
import { displayDiffTable } from "../shared-methods";
import { Pager } from "../../components/Pager";
import ManifestS3Client from "@/s3ApiClient";

export const revalidate = 60;

const s3 = new ManifestS3Client();

export const metadata: Metadata = {
    title: "Manifest list - Manifest.report",
    description: "Find the changes you're looking for.",
    openGraph: {
        title: "Manifest list - Manifest.report",
        description: "Find the changes you're looking for.",
        url: "https://site.manifest.report/manifests",
    },
};

const manifestList = await s3.getManifestList();

const ITEMS_PER_PAGE = 10;

manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
    return (
        new Date(b.DiscoverDate_UTC).getTime() -
        new Date(a.DiscoverDate_UTC).getTime()
    );
});

const manifestListItems = manifestList.slice(0, ITEMS_PER_PAGE);
const currentPage = 1;
const totalPages = Math.ceil(manifestList.length / ITEMS_PER_PAGE);

export default async function Page() {
    return (
        <main className="flex flex-col gap-4 row-start-2 items-start">
            <h2 className="text-lg md:text-4xl header tooltip">
                Manifests / {manifestList.length} manifests stored - Page 1
            </h2>
            <hr className="w-full" />
            {manifestListItems.map((manifest: ManifestListItem) =>
                displayDiffTable(manifest)
            )}
            {totalPages > 1 && (
                <Pager
                    currentPage={currentPage}
                    totalPages={totalPages}
                    pagingLinkPrefix={"/manifests/p"}
                />
            )}
        </main>
    );
}
