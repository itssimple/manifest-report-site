import { displayDiffTable } from "@/app/shared-methods";
import { ManifestListItem } from "@/types/manifestListTypes";
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
  return manifestList.map((post : ManifestListItem) => ({
    version: post.VersionId,
  }))
}

function getManifestFromList(version: string) : ManifestListItem {
	return manifestList.find((post: ManifestListItem) => post.VersionId === version);
}

export async function generateMetadata(
	{ params }: { params: Promise<{ version: string }> },
	//parent: ResolvingMetadata
): Promise<Metadata> {
	const { version } = await params;
	return {
		title: `Manifest version ${version} - Manifest.report`,
		description: `Changes for version ${version}`,
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ version: string }>;
}) {
	const { version } = await params;
	const manifest = getManifestFromList(version);
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center p-8 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-start">
				<h2 className="text-4xl">Manifest: {manifest.Version}</h2>
					{displayDiffTable(manifest)}
			</main>
		</div>)
}