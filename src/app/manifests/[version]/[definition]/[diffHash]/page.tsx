import { JsonDiffView } from "@/app/components/JsonDiffView";
import { getNameFromDisplayProperties } from "@/app/shared-methods";
import { reconstructBeforeAfterForDefinition } from "@/app/utils/jsonDiffUtils";
import ManifestS3Client from "@/s3ApiClient";
import Link from "next/link";

const s3 = new ManifestS3Client();

export const revalidate = 31536000;

export default async function DiffPage({
    params,
}: {
    params: Promise<{ version: string; definition: string; diffHash: string }>;
}) {
    const { version, definition, diffHash } = await params;

    const manifest = await s3.getManifestFromList(version);
    const diffData = await s3.getDiffData(version, definition);

    if (!diffData) {
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
                    /{" "}
                    <Link
                        href={`/manifests/${manifest.VersionId}/${definition}`}
                        className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                    >
                        {definition}
                    </Link>
                    / {diffHash}
                </h2>
                <hr className="w-full" />
                <p>Diff data not found.</p>
            </main>
        );
    }

    const definitionData = await s3.getDefinition(version, definition);

    const diffObjects = Object.keys(diffData!).map((key) => ({
        key,
        definition:
            definitionData && definitionData[key] ? definitionData[key] : null,
        diff: diffData![parseInt(key)],
    }));

    const diffItem = diffObjects.find((i) => i.key === diffHash);

    if (!diffItem) {
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
                    /{" "}
                    <Link
                        href={`/manifests/${manifest.VersionId}/${definition}`}
                        className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                    >
                        {definition}
                    </Link>
                    / {diffHash}
                </h2>
                <hr className="w-full" />
                <p>Diff entry not found.</p>
            </main>
        );
    }

    const definitionObject = diffItem.definition;

    let title = diffItem.key;
    if (
        definitionObject &&
        definitionObject.displayProperties &&
        (definitionObject.displayProperties.name ||
            definitionObject.displayProperties.description)
    ) {
        title = getNameFromDisplayProperties(definitionObject.displayProperties);
    }

    let beforeJson: any | null = null;
    let afterJson: any | null = null;

    if (
        diffItem.definition === null &&
        diffItem.diff.diff.length === 1 &&
        diffItem.diff.diff[0].op === "del"
    ) {
        beforeJson = diffItem.diff.diff[0].old;
        afterJson = null;
    } else if (definitionObject) {
        const reconstructed = reconstructBeforeAfterForDefinition(
            definitionObject,
            diffItem.diff.diff
        );
        beforeJson = reconstructed.before;
        afterJson = reconstructed.after;
    }

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
                /{" "}
                <Link
                    href={`/manifests/${manifest.VersionId}/${definition}`}
                    className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                >
                    {definition}
                </Link>
                / {diffHash}
            </h2>
            <hr className="w-full" />

            <section className="w-full bg-gray-900/80 rounded-lg p-4 border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                    <div>
                        <h3 className="text-xl md:text-2xl fui headers">
                            {title}
                        </h3>
                        <div className="text-xs text-gray-400 mt-1">
                            Hash:{" "}
                            <span className="font-mono bg-black/40 px-2 py-0.5 rounded">
                                {diffItem.key}
                            </span>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400">
                        {diffItem.diff.diff.length.toLocaleString()} change
                        {diffItem.diff.diff.length === 1 ? "" : "s"}
                    </div>
                </div>

                <JsonDiffView
                    before={beforeJson}
                    after={afterJson}
                    ops={diffItem.diff.diff}
                />
            </section>
        </main>
    );
}
