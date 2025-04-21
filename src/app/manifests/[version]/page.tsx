import { displayDiffTable, displayOgDiffTable } from "@/app/shared-methods";
import { ManifestListItem } from "@/types/manifestListTypes";
import { Metadata } from "next";
import { ImageResponse } from "next/og";
import path from "path";
import fs from "fs";
import Link from "next/link";
import ManifestS3Client from "@/s3ApiClient";
import { DebugTimer } from "@/app/debugTimer";

export const revalidate = 3600;

const s3 = new ManifestS3Client();
const manifestList = await s3.getManifestList();

const debugTimer: DebugTimer = new DebugTimer();

export async function generateStaticParams() {
    const staticparams = debugTimer.start("generateStaticParams");
    const paths = manifestList.map((post: ManifestListItem) => ({
        version: post.VersionId,
    }));

    const font = path.join(
        process.cwd(),
        "src",
        "components",
        "assets",
        "fonts",
        "NeueHaasDisplayRoman.woff"
    );
    const fontBuffer = fs.readFileSync(font);

    for (const param of paths) {
        const outputDir = path.join(
            process.cwd(),
            "public",
            "og-images",
            "manifests",
            `og-manifest-${param.version}.png`
        );

        const manifest = await s3.getManifestFromList(param.version);

        const image = new ImageResponse(displayOgDiffTable(manifest), {
            width: 1920,
            height: 1080,
            fonts: [
                {
                    name: "Neue Haas Grotesk Display Pro 55 Roman",
                    data: fontBuffer,
                    style: "normal",
                },
            ],
        });

        const imageBuffer = await image.arrayBuffer();

        fs.mkdirSync(path.dirname(outputDir), { recursive: true });
        fs.writeFileSync(outputDir, Buffer.from(imageBuffer));
    }

    debugTimer.stop(staticparams);

    return paths;
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
    return `Discovered on ${manifest.DiscoverDate_UTC}
	And has ${totalChangedFiles} files changed with a total of ${totalChanges} changes`;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ version: string }>;
}): Promise<Metadata> {
    const { version } = await params;

    const manifest = await s3.getManifestFromList(version);

    return {
        title: `Manifest version ${version} - Manifest.report`,
        description: `Changes for version ${version}`,
        openGraph: {
            title: `Destiny 2 Manifest ${manifest.Version} information`,
            releaseDate: manifest.DiscoverDate_UTC,
            url: `https://site.manifest.report/manifests/${version}`,
            description: ogDescription(manifest),
            images: [
                `https://site.manifest.report/og-images/manifests/og-manifest-${version}.png`,
            ],
        },
    };
}

export default async function Page({
    params,
}: {
    params: Promise<{ version: string }>;
}) {
    const timer = debugTimer.start("Page");
    const { version } = await params;
    const manifest = await s3.getManifestFromList(version);
    const html = (
        <main className="flex flex-col gap-4 row-start-2 items-start">
            <h2 className="text-lg md:text-4xl header tooltip">
                <Link
                    href="/manifests/"
                    className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                >
                    Manifests
                </Link>{" "}
                / {manifest.Version}
            </h2>
            <hr className={"w-full"} />
            {displayDiffTable(manifest)}
        </main>
    );
    debugTimer.stop(timer);

    return (
        <>
            {html}
            {debugTimer.toElements()}
        </>
    );
}
