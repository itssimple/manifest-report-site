import { cleanDefinitionName } from "@/app/shared-methods";
import { DiffFile, ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

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