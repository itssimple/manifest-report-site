//import { Season } from "@/types/destiny2/season";
import {
    DiffEntry,
    FileStatus,
    ManifestListItem,
} from "@/types/manifestListTypes";
import Image from "next/image";
import Link from "next/link";

export function cleanDefinitionName(name: string) {
    return name.replace("/tables/Destiny", "").replace("Definition.json", "");
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

export function isJunkDefinition(name: string): boolean {
    return junkDefinitions.includes(cleanDefinitionName(name));
}

export function displayDate(date: string) {
    const dateObj = new Date(date);
    return dateObj.toISOString();
}

export function displayDiffTable(
    manifest: ManifestListItem,
    noLinks: boolean = false
) {
    return (
        <div className="w-full mb-10" key={manifest.VersionId}>
            <div className="block">
                <div className="float-start text-sm md:text-lg hud headers">
                    {noLinks ? (
                        <div className="underline underline-offset-4 decoration-slate-800">
                            {manifest.VersionId}
                        </div>
                    ) : (
                        <Link
                            href={`/manifests/${manifest.VersionId}`}
                            className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all duration-300"
                        >
                            {manifest.VersionId}
                        </Link>
                    )}
                </div>
                <div className="float-end text-sm md:text-lg clear-end hud headers">
                    {manifest.Version} /{" "}
                    {displayDate(manifest.DiscoverDate_UTC)}
                </div>
            </div>
            <div className="clear-both mb-5"></div>
            {manifest.DiffFiles.length === 0 ? (
                <div className="text-center block italic">
                    No changes in this version
                </div>
            ) : (
                <table className="table-fixed w-full">
                    <thead>
                        <tr>
                            <th className="text-left hud headers">File</th>
                            <th className="text-right hud headers">Added</th>
                            <th className="text-right hud headers">Modified</th>
                            <th className="text-right hud headers">
                                Unclassified
                            </th>
                            <th className="text-right hud headers">Removed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {manifest.DiffFiles.map((file) => (
                            <tr
                                key={file.FileName}
                                className={
                                    isJunkDefinition(file.FileName)
                                        ? " text-gray-50/25 hover:text-white transition-all duration-300"
                                        : "" +
                                          (file.FileStatus === FileStatus.Added
                                              ? " bg-green-950/75"
                                              : "") +
                                          (file.FileStatus ===
                                          FileStatus.Removed
                                              ? " bg-red-950/75"
                                              : "")
                                }
                            >
                                <td className="text-left fui body">
                                    {noLinks ? (
                                        <div className="underline underline-offset-4 decoration-slate-800 transition-all">
                                            {cleanDefinitionName(file.FileName)}
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/manifests/${
                                                manifest.VersionId
                                            }/${cleanDefinitionName(
                                                file.FileName
                                            )}`}
                                            className="underline underline-offset-4 decoration-slate-800 hover:decoration-slate-300 transition-all"
                                        >
                                            {cleanDefinitionName(file.FileName)}
                                        </Link>
                                    )}
                                </td>
                                <td
                                    className={
                                        "text-right fui body numbers" +
                                        (file.Added > 0
                                            ? " text-green-700"
                                            : "")
                                    }
                                >
                                    {file.Added > 0 ? "+" : null}
                                    {file.Added.toLocaleString()}
                                </td>
                                <td
                                    className={
                                        "text-right fui body numbers" +
                                        (file.Modified > 0
                                            ? " text-blue-300"
                                            : "")
                                    }
                                >
                                    {file.Modified.toLocaleString()}
                                </td>
                                <td
                                    className={
                                        "text-right fui body numbers" +
                                        (file.Unclassified > 0
                                            ? " text-green-700"
                                            : "")
                                    }
                                >
                                    {file.Unclassified > 0 ? "+" : null}
                                    {file.Unclassified.toLocaleString()}
                                </td>
                                <td
                                    className={
                                        "text-right fui body numbers" +
                                        (file.Removed > 0
                                            ? " text-red-500"
                                            : "")
                                    }
                                >
                                    {file.Removed > 0 ? "-" : null}
                                    {file.Removed.toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export function displayOgDiffTable(
    manifest: ManifestListItem /*, season: Season | null*/
) {
    const totalAdds = manifest.DiffFiles.reduce(
        (acc, file) => acc + file.Added,
        0
    );
    const totalMods = manifest.DiffFiles.reduce(
        (acc, file) => acc + file.Modified,
        0
    );
    const totalUnclassified = manifest.DiffFiles.reduce(
        (acc, file) => acc + file.Unclassified,
        0
    );
    const totalRemoves = manifest.DiffFiles.reduce(
        (acc, file) => acc + file.Removed,
        0
    );

    return (
        <div
            style={{
                width: "1920px",
                height: "1080px",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#2c2c2c",
                /*backgroundImage: season != null && typeof season.backgroundImagePath !== 'undefined' ? `url(https://www.bungie.net${season.backgroundImagePath})` : '',*/
                backgroundSize: "1920px 1080px",
                backgroundRepeat: "no-repeat",
                color: "white",
                padding: "0.5rem",
                fontFamily: "Neue Haas Grotesk Display Pro 55 Roman",
            }}
            key={manifest.VersionId}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        fontSize: "4.5rem",
                        marginLeft: "1.5rem",
                    }}
                >
                    <div
                        style={{
                            textDecoration: "underline",
                            textDecorationColor: "#d1d5db45",
                            textDecorationThickness: "1px",
                            display: "flex",
                        }}
                    >
                        Changes for {manifest.Version}
                    </div>
                </div>
                <div
                    style={{
                        display: "flex",
                        fontSize: "2.5rem",
                        width: "100%",
                        justifyContent: "flex-start",
                        marginLeft: "1.5rem",
                    }}
                >
                    Manifest discovered:{" "}
                    {displayDate(manifest.DiscoverDate_UTC)}
                </div>
            </div>
            {manifest.DiffFiles.length === 0 ? (
                <div
                    style={{
                        display: "flex",
                        fontStyle: "italic",
                        fontSize: "6.0rem",
                        marginTop: "340px",
                        justifyContent: "center",
                        alignContent: "center",
                    }}
                >
                    No changes in this version
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "center",
                            fontSize: "6.5rem",
                            marginTop: "150px",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "50%",
                            }}
                        >
                            Added
                            <div
                                style={{
                                    display: "flex",
                                    color: totalAdds > 0 ? "#15803d" : "",
                                }}
                            >
                                +{totalAdds.toLocaleString()}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "50%",
                            }}
                        >
                            Modified
                            <div
                                style={{
                                    display: "flex",
                                    color: totalMods > 0 ? "#93c5fd" : "",
                                }}
                            >
                                {totalMods.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            width: "100%",
                            justifyContent: "center",
                            fontSize: "6.5rem",
                            marginBottom: "20px",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "50%",
                            }}
                        >
                            Unclassified
                            <div
                                style={{
                                    display: "flex",
                                    color:
                                        totalUnclassified > 0 ? "#15803d" : "",
                                }}
                            >
                                +{totalUnclassified.toLocaleString()}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                width: "50%",
                            }}
                        >
                            Removed
                            <div
                                style={{
                                    display: "flex",
                                    color: totalRemoves > 0 ? "#ef4444" : "",
                                }}
                            >
                                -{totalRemoves.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            flexWrap: "wrap-reverse",
                            height: "150px",
                        }}
                    >
                        {manifest.DiffFiles.map((file) =>
                            isJunkDefinition(file.FileName) ||
                            file.FileStatus == FileStatus.Modified ? null : (
                                <div
                                    key={file.FileName}
                                    style={{
                                        display: "flex",
                                        width: "19.7%",
                                        backgroundColor:
                                            file.FileStatus === FileStatus.Added
                                                ? "rgba(0, 255, 0, 0.3)"
                                                : file.FileStatus ===
                                                  FileStatus.Removed
                                                ? "rgba(255, 0, 0, 0.3)"
                                                : "",
                                        fontSize: "1.2rem",
                                        padding: "0.25rem",
                                        justifyContent: "center",
                                        marginLeft: "0.3rem",
                                        marginBottom: "0.3rem",
                                    }}
                                >
                                    {cleanDefinitionName(file.FileName)}{" "}
                                    {file.FileStatus === FileStatus.Added
                                        ? "added"
                                        : file.FileStatus === FileStatus.Removed
                                        ? "removed"
                                        : "modified"}
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function getNameFromDisplayProperties(displayProperties: any) {
    if (displayProperties.name) {
        return displayProperties.name;
    } else {
        if (displayProperties.description) {
            return displayProperties.description;
        } else {
            return "<No Name or Description>";
        }
    }
}

export function displayDiffListItem(
    definition: string,
    diffEntry: {
        key: string;
        definition: any;
        diff: {
            diff: DiffEntry[];
        };
    },
    jsonDebug: boolean = false
) {
    let entryName = "No Name";
    let icon = "/img/misc/missing_icon_d2.png";

    if (diffEntry.definition && diffEntry.definition.displayProperties) {
        entryName = getNameFromDisplayProperties(
            diffEntry.definition.displayProperties
        );

        if (diffEntry.definition.displayProperties.icon) {
            icon = diffEntry.definition.displayProperties.icon;
        }
    } else {
        if (diffEntry.definition === null && diffEntry.diff.diff.length === 1) {
            const removedEntryDiff = diffEntry.diff.diff[0];
            if (removedEntryDiff.op === "del") {
                const removedEntry = removedEntryDiff.old;
                if (removedEntry.displayProperties) {
                    entryName = getNameFromDisplayProperties(
                        removedEntry.displayProperties
                    );

                    if (removedEntry.displayProperties.icon) {
                        icon = removedEntry.displayProperties.icon;
                    }
                }
            }
        }
    }

    return (
        <div
            key={diffEntry.key}
            className={"w-full bg-gray-900 p-5 rounded-lg mb-5"}
        >
            <h4 className="text-lg">
                <Image
                    src={`https://www.bungie.net${icon}`}
                    className={"w-10 h-10 inline-block mr-2"}
                    alt=""
                    width={"40"}
                    height={"40"}
                />
                <Link href={`./${definition}/${diffEntry.key}`}>
                    {entryName}
                </Link>
                <div className={"text-base text-gray-400 float-right"}>
                    {diffEntry.key}
                </div>
            </h4>
            <hr className={"w-full mt-2"} />
            <pre>
                <code>
                    {jsonDebug ? JSON.stringify(diffEntry, null, 2) : null}
                </code>
            </pre>
        </div>
    );
}
