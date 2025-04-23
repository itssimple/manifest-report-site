import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { DiffEntryHolder, ManifestListItem } from "./types/manifestListTypes";
import path from "path";
import fs from "fs";

class ManifestS3Client {
    private s3Client: S3Client;

    private manifestList: ManifestListItem[] = [];

    private rootCacheFolder: string =
        process.env.CACHEFOLDER ?? path.join(process.cwd(), ".manifest-cache");

    constructor() {
        this.s3Client = new S3Client({
            region: "manifest-report",
            credentials: {
                accessKeyId: process.env.S3ACCESSKEY!,
                secretAccessKey: process.env.S3SECRETKEY!,
            },
            endpoint: process.env.S3ENDPOINT!,
            forcePathStyle: true,
        });
    }

    async getManifestList(): Promise<ManifestListItem[]> {
        const getManifestList = new GetObjectCommand({
            Bucket: "manifest-archive",
            Key: "list.json",
        });

        const manifestListObject = await this.s3Client.send(getManifestList);

        const manifestList: ManifestListItem[] = JSON.parse(
            await manifestListObject.Body!.transformToString()
        );

        this.manifestList = manifestList;

        return manifestList;
    }

    async getDefinition(version: string, definition: string) {
        const outputDir = path.join(
            this.rootCacheFolder,
            "definitions",
            `version-${version}`,
            `${definition}Definition.json`
        );

        if (fs.existsSync(outputDir)) {
            const definitionData = fs.readFileSync(outputDir, "utf-8");
            return JSON.parse(definitionData);
        }

        try {
            const getManifestDefinition = new GetObjectCommand({
                Bucket: "manifest-archive",
                Key: `versions/${version}/tables/Destiny${definition}Definition.json`,
            });

            const manifestDefinition = await this.s3Client.send(
                getManifestDefinition
            );

            const definitionData = JSON.parse(
                await manifestDefinition.Body!.transformToString()
            );

            fs.mkdirSync(path.dirname(outputDir), { recursive: true });
            fs.writeFileSync(outputDir, JSON.stringify(definitionData));

            return definitionData;
        } catch {
            return null;
        }
    }

    async getDiffData(version: string, definition: string) {
        const outputDir = path.join(
            this.rootCacheFolder,
            "diffs",
            `version-${version}`,
            `${definition}Diff.json`
        );

        if (fs.existsSync(outputDir)) {
            const diffData = fs.readFileSync(outputDir, "utf-8");
            return JSON.parse(diffData);
        }

        try {
            const getManifestDiff = new GetObjectCommand({
                Bucket: "manifest-archive",
                Key: `versions/${version}/diffFiles/Destiny${definition}Definition.json`,
            });

            const manifestDiff = await this.s3Client.send(getManifestDiff);

            const diffData: DiffEntryHolder = JSON.parse(
                await manifestDiff.Body!.transformToString()
            );

            const outputDir = path.join(
                this.rootCacheFolder,
                "diffs",
                `version-${version}`,
                `${definition}Diff.json`
            );

            fs.mkdirSync(path.dirname(outputDir), { recursive: true });
            fs.writeFileSync(outputDir, JSON.stringify(diffData));

            return diffData;
        } catch {
            return null;
        }
    }

    async getManifestFromList(version: string): Promise<ManifestListItem> {
        if (this.manifestList.length === 0) {
            await this.getManifestList();
        }

        return this.manifestList.find(
            (post: ManifestListItem) => post.VersionId === version
        )!;
    }
}

export default ManifestS3Client;
