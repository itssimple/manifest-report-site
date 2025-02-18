import { cleanDefinitionName } from "@/app/shared-methods";
import { DiffFile, ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";

const s3 = new S3Client({
	region: "manifest-report",
	credentials: {
		accessKeyId: process.env.S3ACCESSKEY!,
		secretAccessKey: process.env.S3SECRETKEY!
	},
	endpoint: process.env.S3ENDPOINT!,
	forcePathStyle: true
}
);

const getManifestList = new GetObjectCommand({
	Bucket: "manifest-archive",
	Key: "list.json",
});

const manifestListObject = await s3.send(getManifestList);

const manifestList = JSON.parse(await manifestListObject.Body!.transformToString());

export async function generateStaticParams() {
	return manifestList.flatMap((post: ManifestListItem) =>
		post.DiffFiles.map((file: DiffFile) => ({
			version: post.VersionId,
			definition: cleanDefinitionName(file.FileName)
		})));
}

function getManifestFromList(version: string) : ManifestListItem {
	return manifestList.find((post: ManifestListItem) => post.VersionId === version);
}

function ogDescription(manifest: ManifestListItem) {
	let totalChangedFiles = 0;
	let totalChanges = 0;
	manifest.DiffFiles.forEach((file) => {
		totalChangedFiles++;
		totalChanges += file.Added + file.Modified + file.Unclassified + file.Removed + file.Reclassified;
	});
	return `Manifest version ${manifest.Version} was discovered on ${manifest.DiscoverDate_UTC}
	And has ${totalChangedFiles} files changed with a total of ${totalChanges} changes`;
}

export async function generateMetadata(
	{
		params,
	}: {
		params: Promise<{ version: string, definition: string }>;
	},
	//parent: ResolvingMetadata
): Promise<Metadata> {
	const { version, definition } = await params;

	const manifest = getManifestFromList(version);
	return {
		title: `Manifest version ${version}, definition ${definition} - Manifest.report`,
		description: `Changes for definition ${definition} in version ${version}`,
		openGraph: {
			title: `Destiny 2 Manifest ${manifest.Version}/${definition} information`,
			releaseDate: getManifestFromList(version).DiscoverDate_UTC,
			url: `https://site.manifest.report/manifests/${version}/${definition}`,
			description: ogDescription(manifest)
		}
	}
}

export default async function ManifestVersion({
	params,
}: {
	params: Promise<{ version: string, definition: string }>;
}) {
	const { version, definition } = await params;
	return (

			<main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<div>Manifest version: {version}, Definition: {definition}</div>
				I might be fast, but I&apos;m not that fast.
			</main>
)
}