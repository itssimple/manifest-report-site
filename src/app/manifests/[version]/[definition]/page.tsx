import { DebugTimer } from "@/app/debugTimer";
import { cleanDefinitionName, displayDiffListItem } from "@/app/shared-methods";
import ManifestS3Client from "@/s3ApiClient";
import {
    DiffEntry,
    DiffEntryHolder,
    DiffFile,
    ManifestListItem,
} from "@/types/manifestListTypes";
import { Metadata } from "next";
import Link from "next/link";

export const revalidate = 3600;

const debugTimer: DebugTimer = new DebugTimer();

const s3 = new ManifestS3Client();
const manifestList = await s3.getManifestList();

const JSON_DEBUG = process.env.JSONDEBUG === "true";

export async function generateStaticParams() {
    return manifestList.flatMap((post: ManifestListItem) =>
        post.DiffFiles.map((file: DiffFile) => ({
            version: post.VersionId,
            definition: cleanDefinitionName(file.FileName),
        }))
    );
}

function ogDescription(manifest: ManifestListItem) {
    const ogTimer = debugTimer.start("ogDescription");
    let totalChangedFiles = 0;
    let totalChanges = 0;
    manifest.DiffFiles.forEach((file) => {
        totalChangedFiles++;
        totalChanges +=
            file.Added +
            file.Modified +
            file.Unclassified +
            file.Removed +
            file.Reclassified;
    });
    debugTimer.stop(ogTimer);
    return `Manifest version ${manifest.Version} was discovered on ${manifest.DiscoverDate_UTC}
	And has ${totalChangedFiles} files changed with a total of ${totalChanges} changes`;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ version: string; definition: string }>;
}): //parent: ResolvingMetadata
Promise<Metadata> {
    const metadataTimer = debugTimer.start("generateMetadata");
    const { version, definition } = await params;

    const manifest = await s3.getManifestFromList(version);
    debugTimer.stop(metadataTimer);
    return {
        title: `Manifest version ${version}, definition ${definition} - Manifest.report`,
        description: `Changes for definition ${definition} in version ${version}`,
        openGraph: {
            title: `Destiny 2 Manifest ${manifest.Version}/${definition} information`,
            releaseDate: manifest.DiscoverDate_UTC,
            url: `https://site.manifest.report/manifests/${version}/${definition}`,
            description: ogDescription(manifest),
        },
    };
}

export default async function ManifestVersion({
    params,
}: {
    params: Promise<{ version: string; definition: string }>;
}) {
    const timer = debugTimer.start("ManifestVersion");
    const { version, definition } = await params;

    const manifest = await s3.getManifestFromList(version);
    const file = manifest.DiffFiles.find(
        (file: DiffFile) => cleanDefinitionName(file.FileName) === definition
    )!;

    // Load in the manifest definition file and the diff file
    const definitionTimer = debugTimer.start("getDefinition");
    const definitionData = await s3.getDefinition(version, definition);
    debugTimer.stop(definitionTimer);

    const diffTimer = debugTimer.start("getDiffData");
    const diffData: DiffEntryHolder | null = await s3.getDiffData(
        version,
        definition
    );
    debugTimer.stop(diffTimer);

    const buildObjectsTimer = debugTimer.start("buildObjects");
    // Get all objects from definitionData based on the Object.keys from diffData
    const diffObjects = Object.keys(diffData!).map((key) => ({
        key,
        definition:
            definitionData && definitionData[key] ? definitionData[key] : null,
        diff: diffData![parseInt(key)],
    }));

    // Get all objects that contains a diff with the path ending in redacted

    const addedObjects = diffObjects.filter((object) =>
        object.diff.diff.every(
            (diff: DiffEntry) =>
                diff.op === "add" && diff.path.split("/").length === 2
        )
    );

    const unClassifiedObjects = diffObjects.filter((object) =>
        object.diff.diff.some(
            (diff: DiffEntry) =>
                diff.path.endsWith("redacted") && diff.new === false
        )
    );

    const removedObjects = diffObjects.filter((object) =>
        object.diff.diff.every(
            (diff: DiffEntry) =>
                diff.op === "del" && diff.path.split("/").length === 2
        )
    );

    // Modified objects are the rest of the objects that are not added, unclassified or removed
    const modifiedObjects = diffObjects.filter(
        (object) =>
            !addedObjects.includes(object) &&
            !unClassifiedObjects.includes(object) &&
            !removedObjects.includes(object)
    );

    const tooBigManifestsForJson = [
        "b026c2b3-2c91-4357-824f-59956ac1256a",
        "879f9b9c-44de-4415-9c02-47efba8b8578",
        "b236dc4b-cff6-4539-9e09-1525582fbe82",
    ];

    debugTimer.stop(buildObjectsTimer);

    const jsonDebug = JSON_DEBUG && !tooBigManifestsForJson.includes(version);

    const returnHtml = (
        <main className="flex flex-col gap-4 row-start-2 items-start">
            <h2 className="text-lg md:text-4xl header tooltip">
                <Link
                    href="/manifests/"
                    className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                >
                    Manifests
                </Link>{" "}
                /{" "}
                <Link
                    href={`/manifests/${manifest.VersionId}`}
                    className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                >
                    {manifest.Version}
                </Link>{" "}
                / {definition}
            </h2>
            <hr className={"w-full"} />
            <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file?.Added > 0 ? " text-green-700" : "")
                        }
                    >
                        {file.Added > 0 ? "+" : null}
                        {file?.Added.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50 text-right">
                        {file.Added > 0 ? (
                            <Link href="#added">Added</Link>
                        ) : (
                            "Added"
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Modified > 0 ? " text-blue-300" : "")
                        }
                    >
                        {file?.Modified.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50 text-right">
                        {file.Modified > 0 ? (
                            <Link href="#modified">Modified</Link>
                        ) : (
                            "Modified"
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Unclassified > 0 ? " text-green-700" : "")
                        }
                    >
                        {file.Unclassified > 0 ? "+" : null}
                        {file?.Unclassified.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50 text-right">
                        {file.Unclassified > 0 ? (
                            <Link href="#unclassified">Unclassified</Link>
                        ) : (
                            "Unclassified"
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Removed > 0 ? " text-red-500" : "")
                        }
                    >
                        {file.Removed > 0 ? "-" : null}
                        {file?.Removed.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50">
                        {file.Removed > 0 ? (
                            <Link href="#removed">Removed</Link>
                        ) : (
                            "Removed"
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-2xl text-right">
                        {file?.Reclassified.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50 text-right">
                        {file.Reclassified > 0 ? (
                            <Link href="#reclassified">Reclassified</Link>
                        ) : (
                            "Reclassified"
                        )}
                    </div>
                </div>
            </div>
            {/* Sections per type, if there are any changes, otherwise don't render the section */}
            {addedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3
                        className="text-2xl underline underline-offset-4 decoration-slate-800"
                        id="added"
                    >
                        Added
                    </h3>
                    {addedObjects.map((object) =>
                        displayDiffListItem(object, jsonDebug)
                    )}
                </div>
            )}
            {modifiedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3
                        className="text-2xl underline underline-offset-4 decoration-slate-800"
                        id="modified"
                    >
                        Modified
                    </h3>
                    {modifiedObjects.map((object) =>
                        displayDiffListItem(object, jsonDebug)
                    )}
                </div>
            )}
            {unClassifiedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3
                        className="text-2xl underline underline-offset-4 decoration-slate-800"
                        id="unclassified"
                    >
                        Unclassified
                    </h3>
                    {unClassifiedObjects.map((object) =>
                        displayDiffListItem(object, jsonDebug)
                    )}
                </div>
            )}
            {removedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3
                        className="text-2xl underline underline-offset-4 decoration-slate-800"
                        id="removed"
                    >
                        Removed
                    </h3>
                    {removedObjects.map((object) =>
                        displayDiffListItem(object, jsonDebug)
                    )}
                </div>
            )}
        </main>
    );

    debugTimer.stop(timer);

    return (
        <>
            {returnHtml}
            {debugTimer.toElements()}
        </>
    );
}
