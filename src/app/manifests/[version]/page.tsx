import { ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export async function generateStaticParams() {
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

  return manifestList.map((post : ManifestListItem) => ({
    version: post.VersionId,
  }))
}

export default async function ManifestVersion({
	params,
}: {
	params: Promise<{ version: string }>;
}) {
	const { version } = await params;
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
				<div>Manifest version: {version}</div>
				I might be fast, but I&apos;m not that fast.
			</main>
			</div>)
}