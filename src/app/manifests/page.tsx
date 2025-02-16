import { ManifestListItem } from "@/types/manifestListTypes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Metadata } from "next";
import Link from "next/link";

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

export const metadata: Metadata = {
  title: "Manifest list - Manifest.report",
  description: "Find the changes you're looking for.",
};

const manifestListObject = await s3.send(getManifestList);

const manifestList = JSON.parse(await manifestListObject.Body!.transformToString());

manifestList.sort((a: ManifestListItem, b: ManifestListItem) => {
	return new Date(b.DiscoverDate_UTC).getTime() - new Date(a.DiscoverDate_UTC).getTime();
});

function displayDate(date: string) {
	const dateObj = new Date(date);
	return dateObj.toISOString();
}

const junkDefinitions = [
  "RewardItemList",
  "SackRewardItemList",
  "SandboxPattern",
  "Unlock",
  "MaterialRequirementSet",
  "NodeStepSummary",
  "ArtDyeChannel",
  "ArtDyeReference",
  "ProgressionMapping",
  "RewardSource",
  "UnlockValue",
  "RewardMapping",
  "RewardSheet",
  "ActivityInteractable",
  "EntitlementOffer",
  "PlatformBucketMapping",
  "PresentationNodeBase",
  "CharacterCustomizationCategory",
  "CharacterCustomizationOption",
  "RewardAdjusterProgressionMap",
  "UnlockCountMapping",
  "UnlockEvent",
  "UnlockExpressionMapping",
  "RewardAdjusterPointer",
  "InventoryItemLite",
];

function cleanDefinitionName(name: string) {
	return name.replace('/tables/Destiny', '').replace('Definition.json', '');
}

function isJunkDefinition(name: string) {
	return junkDefinitions.includes(name);
}

export default async function ManifestList() {
	return (
		<div className="grid grid-rows-[20px_1fr_20px] items-center p-8 min-h-screen font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 row-start-2 items-start">
				<h2 className="text-4xl">Manifest list: {manifestList.length} manifests stored</h2>
				<hr />
				{manifestList.map((manifest : ManifestListItem) => (
					<div className="w-full mb-10" key={manifest.VersionId}>
						<div className="block">
							<div className="float-start text-lg">
								<Link href={`/manifests/${manifest.VersionId}`} className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300">{manifest.VersionId}</Link>
							</div>
							<div className="float-end text-lg clear-end">
								{manifest.Version} / {displayDate(manifest.DiscoverDate_UTC)}
							</div>
						</div>
						<div className="clear-both mb-5"></div>
						{manifest.DiffFiles.length === 0 ?
							<div className="text-center block italic">No changes</div> :
							<table className="table-fixed w-full">
								<thead>
									<tr>
										<th className="text-left">File</th>
										<th className="text-right">Added</th>
										<th className="text-right">Modified</th>
										<th className="text-right">Unclassified</th>
										<th className="text-right">Removed</th>
									</tr>
								</thead>
								<tbody>
									{manifest.DiffFiles.map((file) => (
										<tr key={file.FileName}
											className={isJunkDefinition(cleanDefinitionName(file.FileName)) ?
												" text-gray-50/25 hover:text-white transition-all duration-300" :
												""}
										>
											<td className="text-left">
												<Link href={`/manifests/${manifest.VersionId}/${cleanDefinitionName(file.FileName)}`}
													className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all">
													{cleanDefinitionName(file.FileName)}
												</Link>
											</td>
											<td className={
												"text-right" +
												(file.Added > 0 ? " text-green-700" : "")
											}>
												{file.Added > 0 ? "+" : null}
												{file.Added.toLocaleString()}
											</td>
											<td className={
												"text-right" +
												(file.Modified > 0 ? " text-blue-300" : "")
											}>
												{file.Modified.toLocaleString()}
											</td>
											<td className={
												"text-right" +
												(file.Unclassified > 0 ? " text-green-700" : "")
											}>
												{file.Unclassified > 0 ? "+" : null}
												{file.Unclassified.toLocaleString()}
											</td>
											<td className={
												"text-right" +
												(file.Removed > 0 ? " text-red-500" : "")
											}>
												{file.Removed > 0 ? "-" : null}
												{file.Removed.toLocaleString()}
											</td>
										</tr>
									))}
								</tbody>
							</table>}
					</div>
				))}
			</main>
		</div>
	)
}