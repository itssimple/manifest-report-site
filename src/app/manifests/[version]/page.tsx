import { displayDiffTable, displayOgDiffTable } from "@/app/shared-methods";
import { ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";
import { ImageResponse } from "next/og";
import path from "path";
import fs from "fs";
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

        const manifest = getManifestFromList(param.version);

        // const getSeasonDefinition = new GetObjectCommand({
        // 	Bucket: "manifest-archive",
        // 	Key: `versions/${param.version}/tables/DestinySeasonDefinition.json`,
        // });

        // const seasonDefinitionObject = await s3.send(getSeasonDefinition);

        // const seasonDefinition = JSON.parse(await seasonDefinitionObject.Body!.transformToString());

        // let latestSeason = null;

        // const seasonHashes = Object.keys(seasonDefinition);

        // for (const seasonHash of seasonHashes) {
        // 	const season = seasonDefinition[seasonHash];
        // 	if (season.startDate && season.endDate) {
        // 		const startDate = new Date(season.startDate);
        // 		const endDate = new Date(season.endDate);

        // 		if (latestSeason === null && typeof season.backgroundImagePath !== 'undefined') {
        // 			latestSeason = season;
        // 		}

        // 		if (latestSeason !== null && startDate > new Date(latestSeason.startDate) && endDate > new Date(latestSeason.endDate) && typeof season.backgroundImagePath !== 'undefined') {
        // 			latestSeason = season;
        // 		}
        // 	}
        // }

        const image = new ImageResponse(
            displayOgDiffTable(manifest /*, latestSeason*/),
            {
                width: 1920,
                height: 1080,
                fonts: [
                    {
                        name: "Neue Haas Grotesk Display Pro 55 Roman",
                        data: fontBuffer,
                        style: "normal",
                    },
                ],
            }
        );

        const imageBuffer = await image.arrayBuffer();

        fs.mkdirSync(path.dirname(outputDir), { recursive: true });
        fs.writeFileSync(outputDir, Buffer.from(imageBuffer));
    }

    return paths;
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
    return `Discovered on ${manifest.DiscoverDate_UTC}
	And has ${totalChangedFiles} files changed with a total of ${totalChanges} changes`;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ version: string }>;
}): //parent: ResolvingMetadata
Promise<Metadata> {
    const { version } = await params;

    const manifest = getManifestFromList(version);

    return {
        title: `Manifest version ${version} - Manifest.report`,
        description: `Changes for version ${version}`,
        openGraph: {
            title: `Destiny 2 Manifest ${manifest.Version} information`,
            releaseDate: getManifestFromList(version).DiscoverDate_UTC,
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
    const { version } = await params;
    const manifest = getManifestFromList(version);
    return (
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
}
