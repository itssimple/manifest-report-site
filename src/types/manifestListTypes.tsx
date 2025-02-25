export enum FileStatus {
    Added = 0,
    Modified = 1,
    Removed = 2,
}

export type ManifestListItem = {
    VersionId: string;
    Version: string;
    ManifestJsonPath: string;
    EnhancedManifestJsonPath: string;
    DiscoverDate_UTC: string;
    ManifestDate_UTC: string;
    DiffFiles: DiffFile[];
};

export type DiffFile = {
    FileName: string;
    EnhancedFileName: string;
    Added: number;
    Modified: number;
    Unclassified: number;
    Reclassified: number;
    Removed: number;
    FileStatus: FileStatus;
};

export type DiffEntryHolder = {
    [hash: number]: {
        diff: DiffEntry[];
    };
};

export type DiffEntry = {
    op: "add" | "edit" | "del";
    path: string;
    old: any | undefined | null;
    new: any | undefined | null;
};
