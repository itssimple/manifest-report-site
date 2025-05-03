import ManifestS3Client from "@/s3ApiClient";
import { ManifestListItem } from "@/types/manifestListTypes";

export const revalidate = 60;

const s3 = new ManifestS3Client();

export async function GET() {
    const manifestList = await s3.getManifestList();

    manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
        return (
            new Date(b.DiscoverDate_UTC).getTime() -
            new Date(a.DiscoverDate_UTC).getTime()
        );
    });

    const latestManifestListItem = manifestList.slice(0, 1)[0];

    const manifest = {
        version: latestManifestListItem.Version,
        discoverDate: latestManifestListItem.DiscoverDate_UTC,
        manifestListItem: latestManifestListItem,
        manifestInfo: `https://storage.manifest.report/manifest-archive/versions/${latestManifestListItem.VersionId}/manifest.json`,
        manifestEnhancedInfo: `https://storage.manifest.report/manifest-archive/versions/${latestManifestListItem.VersionId}/enhanced-manifest.json`,
    };

    return Response.json(manifest);
}
