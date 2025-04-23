import ManifestS3Client from "@/s3ApiClient";
import Link from "next/link";

const s3 = new ManifestS3Client();

const JSON_DEBUG = process.env.JSONDEBUG === "true";

export default async function DiffPage({
    params,
}: {
    params: Promise<{ version: string; definition: string; diffHash: string }>;
}) {
    const { version, definition, diffHash } = await params;

    console.log(await params);
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
            <pre>
                <code>
                    {JSON_DEBUG ? JSON.stringify(diffItem, null, 2) : null}
                </code>
            </pre>
        </main>
    );
}
