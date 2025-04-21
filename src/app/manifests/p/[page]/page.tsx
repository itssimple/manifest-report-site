import { Pager } from "@/components/Pager";
import { displayDiffTable } from "@/app/shared-methods";
import { ManifestListItem } from "@/types/manifestListTypes";
import { Metadata } from "next";
import ManifestS3Client from "@/s3ApiClient";

const s3 = new ManifestS3Client();

const manifestList = await s3.getManifestList();

manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
    return (
        new Date(b.DiscoverDate_UTC).getTime() -
        new Date(a.DiscoverDate_UTC).getTime()
    );
});

const ITEMS_PER_PAGE = 10;

export const metadata: Metadata = {
    title: "Manifest list - Manifest.report",
    description: "Find the changes you're looking for.",
    openGraph: {
        title: "Manifest list - Manifest.report",
        description: "Find the changes you're looking for.",
        url: "https://site.manifest.report/manifests",
    },
};

export async function generateStaticParams() {
    // Generate static pages for each page of the manifest list
    return Array.from(
        { length: Math.ceil(manifestList.length / ITEMS_PER_PAGE) + 1 },
        (_, i) => ({
            page: i.toString(),
        })
    );
}

export default async function Page({
    params,
}: {
    params: Promise<{ page: number }>;
}) {
    const { page } = await params;

    const currentPage = page;
    const totalPages = Math.ceil(manifestList.length / ITEMS_PER_PAGE);
    const manifestListItems = manifestList.slice(
        ITEMS_PER_PAGE * (currentPage - 1),
        ITEMS_PER_PAGE * currentPage
    );

    return (
        <main className="flex flex-col gap-4 row-start-2 items-start">
            <h2 className="text-lg md:text-4xl header tooltip">
                Manifests / {manifestList.length} manifests stored - Page {page}
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
