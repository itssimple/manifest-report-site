import { cleanDefinitionName } from "@/app/shared-methods";
import {
    DiffEntry,
    DiffEntryHolder,
    DiffFile,
    ManifestListItem,
} from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";

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
    const getManifestDefinition = new GetObjectCommand({
        Bucket: "manifest-archive",
        Key: `versions/${version}/tables/Destiny${definition}Definition.json`,
    });

    const getManifestDiff = new GetObjectCommand({
        Bucket: "manifest-archive",
        Key: `versions/${version}/diffFiles/Destiny${definition}Definition.json`,
    });

    const manifestDefinition = await s3.send(getManifestDefinition);
    const manifestDiff = await s3.send(getManifestDiff);

    const definitionData = JSON.parse(
        await manifestDefinition.Body!.transformToString()
    );

    const diffData: DiffEntryHolder = JSON.parse(
        await manifestDiff.Body!.transformToString()
    );
    // Get all objects from definitionData based on the Object.keys from diffData
    const diffObjects = Object.keys(diffData).map((key) => ({
        key,
        definition: definitionData[key],
        diff: diffData[parseInt(key)],
    }));

    // Get all objects that contains a diff with the path ending in redacted

    const addedObjects = diffObjects.filter((object) =>
        object.diff.diff.every((diff: DiffEntry) => diff.op === "add")
    );

    const modifiedObjects = diffObjects.filter((object) =>
        object.diff.diff.some((diff: DiffEntry) => diff.op === "edit")
    );

    const unClassifiedObjects = diffObjects.filter((object) =>
        object.diff.diff.some(
            (diff: DiffEntry) =>
                diff.path.endsWith("redacted") && diff.new === false
        )
    );

    const removedObjects = diffObjects.filter((object) =>
        object.diff.diff.every((diff: DiffEntry) => diff.op === "del")
    );

    console.log("Added", addedObjects);
    console.log("Modified", modifiedObjects);
    console.log("Unclassified", unClassifiedObjects);
    console.log("Removed", removedObjects);

    return (
        <main className="flex flex-col gap-4 row-start-2 items-start">
            <h2 className="text-lg md:text-4xl header tooltip">
                Manifest information: {manifest.Version} / {definition}
            </h2>
            <hr className={"w-full"} />
            {/* One column per type to fill the entire row, that tells you how many changes there were in a big white colour, and then under it in slightly more transparent text, what type it is */}
            <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file?.Added > 0 ? " text-green-700" : "")
                        }
                    >
                        {file.Added > 0 ? "+" : null}
                        {file?.Added}
                    </div>
                    <div className="text-sm text-gray-50/50">Added</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Modified > 0 ? " text-blue-300" : "")
                        }
                    >
                        {file?.Modified}
                    </div>
                    <div className="text-sm text-gray-50/50">Modified</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Unclassified > 0 ? " text-green-700" : "")
                        }
                    >
                        {file.Unclassified > 0 ? "+" : null}
                        {file?.Unclassified}
                    </div>
                    <div className="text-sm text-gray-50/50">Unclassified</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div
                        className={
                            "text-2xl text-right" +
                            (file.Removed > 0 ? " text-red-500" : "")
                        }
                    >
                        {file.Removed > 0 ? "-" : null}
                        {file?.Removed}
                    </div>
                    <div className="text-sm text-gray-50/50">Removed</div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="text-2xl text-right">
                        {file?.Reclassified}
                    </div>
                    <div className="text-sm text-gray-50/50">Reclassified</div>
                </div>
            </div>
        </main>
    );
}
