import { FileStatus, ManifestListItem } from "@/types/manifestListTypes";
import Link from "next/link";

export function cleanDefinitionName(name: string) {
	return name.replace('/tables/Destiny', '').replace('Definition.json', '');
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

export function isJunkDefinition(name: string) : boolean {
	return junkDefinitions.includes(cleanDefinitionName(name));
}

export function displayDate(date: string) {
	const dateObj = new Date(date);
	return dateObj.toISOString();
}

export function displayDiffTable(manifest: ManifestListItem) {
  return (<div className="w-full mb-10" key={manifest.VersionId}>
    <div className="block">
      <div className="float-start text-sm md:text-lg">
        <Link href={`/manifests/${manifest.VersionId}`} className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300">{manifest.VersionId}</Link>
      </div>
      <div className="float-end text-sm md:text-lg clear-end">
        {manifest.Version} / {displayDate(manifest.DiscoverDate_UTC)}
      </div>
    </div>
    <div className="clear-both mb-5"></div>
    {manifest.DiffFiles.length === 0 ?
      <div className="text-center block italic">No changes in this version</div> :
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
              className={isJunkDefinition(file.FileName) ?
                " text-gray-50/25 hover:text-white transition-all duration-300" :
                ""
                + (file.FileStatus === FileStatus.Added ? " bg-green-950/75" : "")
              + (file.FileStatus === FileStatus.Removed ? " bg-red-950/75" : "")}
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
  </div>);
}