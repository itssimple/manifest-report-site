import { cleanDefinitionName, displayDiffListItem } from "@/app/shared-methods";
import {
    DiffEntry,
    DiffEntryHolder,
    DiffFile,
    ManifestListItem,
} from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";
import Link from "next/link";

const s3 = new S3Client({
    region: "manifest-report",
    credentials: {
        accessKeyId: process.env.S3ACCESSKEY!,
        secretAccessKey: process.env.S3SECRETKEY!,
    },
    endpoint: process.env.S3ENDPOINT!,
    forcePathStyle: true,
});

const getManifestList = new GetObjectCommand({
    Bucket: "manifest-archive",
    Key: "list.json",
});

const manifestListObject = await s3.send(getManifestList);

const manifestList = JSON.parse(
    await manifestListObject.Body!.transformToString()
);

export async function generateStaticParams() {
    return manifestList.flatMap((post: ManifestListItem) =>
        post.DiffFiles.map((file: DiffFile) => ({
            version: post.VersionId,
            definition: cleanDefinitionName(file.FileName),
        }))
    );
}

function getManifestFromList(version: string): ManifestListItem {
    return manifestList.find(
        (post: ManifestListItem) => post.VersionId === version
    );
}

function ogDescription(manifest: ManifestListItem) {
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
    return `Manifest version ${manifest.Version} was discovered on ${manifest.DiscoverDate_UTC}
	And has ${totalChangedFiles} files changed with a total of ${totalChanges} changes`;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ version: string; definition: string }>;
}): //parent: ResolvingMetadata
Promise<Metadata> {
    const { version, definition } = await params;

    const manifest = getManifestFromList(version);
    return {
        title: `Manifest version ${version}, definition ${definition} - Manifest.report`,
        description: `Changes for definition ${definition} in version ${version}`,
        openGraph: {
            title: `Destiny 2 Manifest ${manifest.Version}/${definition} information`,
            releaseDate: getManifestFromList(version).DiscoverDate_UTC,
            url: `https://site.manifest.report/manifests/${version}/${definition}`,
            description: ogDescription(manifest),
        },
    };
}

async function getDefinition(version: string, definition: string) {
    try {
        const getManifestDefinition = new GetObjectCommand({
            Bucket: "manifest-archive",
            Key: `versions/${version}/tables/Destiny${definition}Definition.json`,
        });

        const manifestDefinition = await s3.send(getManifestDefinition);

        const definitionData = JSON.parse(
            await manifestDefinition.Body!.transformToString()
        );
        return definitionData;
    } catch {
        return null;
    }
}

async function getDiffData(version: string, definition: string) {
    try {
        const getManifestDiff = new GetObjectCommand({
            Bucket: "manifest-archive",
            Key: `versions/${version}/diffFiles/Destiny${definition}Definition.json`,
        });

        const manifestDiff = await s3.send(getManifestDiff);

        const diffData: DiffEntryHolder = JSON.parse(
            await manifestDiff.Body!.transformToString()
        );
        return diffData;
    } catch {
        return null;
    }
}

export default async function ManifestVersion({
    params,
}: {
    params: Promise<{ version: string; definition: string }>;
}) {
    const { version, definition } = await params;

    const manifest = getManifestFromList(version);
    const file = manifest.DiffFiles.find(
        (file: DiffFile) => cleanDefinitionName(file.FileName) === definition
    )!;

    // Load in the manifest definition file and the diff file
    const definitionData = await getDefinition(version, definition);

    const diffData: DiffEntryHolder | null = await getDiffData(
        version,
        definition
    );
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

    return (
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
                        Added
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
                        Modified
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
                        Unclassified
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
                    <div className="text-sm text-gray-50/50">Removed</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-2xl text-right">
                        {file?.Reclassified.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-50/50 text-right">
                        Reclassified
                    </div>
                </div>
            </div>
            {/* Sections per type, if there are any changes, otherwise don't render the section */}
            {addedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3 className="text-2xl underline underline-offset-4 decoration-slate-800">
                        Added
                    </h3>
                    {addedObjects.map((object) => displayDiffListItem(object))}
                </div>
            )}
            {modifiedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3 className="text-2xl underline underline-offset-4 decoration-slate-800">
                        Modified
                    </h3>
                    {modifiedObjects.map((object) =>
                        displayDiffListItem(object)
                    )}
                </div>
            )}
            {unClassifiedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3 className="text-2xl underline underline-offset-4 decoration-slate-800">
                        Unclassified
                    </h3>
                    {unClassifiedObjects.map((object) =>
                        displayDiffListItem(object)
                    )}
                </div>
            )}
            {removedObjects.length > 0 && (
                <div className="w-full flex flex-col gap-4">
                    <h3 className="text-2xl underline underline-offset-4 decoration-slate-800">
                        Removed
                    </h3>
                    {removedObjects.map((object) =>
                        displayDiffListItem(object)
                    )}
                </div>
            )}
        </main>
    );
}
