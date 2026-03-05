import { DiffEntry } from "@/types/manifestListTypes";

export type JsonPointerSegment = string | number;

export type JsonPointerPath = JsonPointerSegment[];

export type DiffAnnotation = {
    path: string;
    type: DiffEntry["op"];
    oldValue: any | null | undefined;
    newValue: any | null | undefined;
};

export function parseJsonPointer(path: string, hash: string): JsonPointerPath {
    if (!path || path === "/") {
        return [];
    }

    if (path.startsWith(`/${hash}`)) {
        path = path.slice(`/${hash}`.length);
    }

    return path
        .split("/")
        .filter((segment) => segment.length > 0)
        .map((segment) => {
            const index = Number(segment);
            return Number.isNaN(index) ? segment : index;
        });
}

export function valueToPrettyJson(value: any): string {
    if (typeof value === "undefined") {
        return "undefined";
    }

    if (value === null || typeof value === "undefined") {
        return "";
    }

    return JSON.stringify(value, null, 2);
}

export function buildDiffAnnotations(ops: DiffEntry[]): DiffAnnotation[] {
    return ops.map((entry) => ({
        path: entry.path,
        type: entry.op,
        oldValue: entry.old,
        newValue: entry.new,
    }));
}

function cloneDeep<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function setByPath(target: any, path: JsonPointerPath, value: any) {
    if (path.length === 0) {
        return;
    }

    let current = target;
    for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        const nextIsIndex =
            typeof path[i + 1] === "number" ||
            /^[0-9]+$/.test(String(path[i + 1]));

        if (typeof segment === "number") {
            if (!Array.isArray(current)) {
                return;
            }
            if (!current[segment]) {
                current[segment] = nextIsIndex ? [] : {};
            }
            current = current[segment];
        } else {
            if (
                typeof current[segment] !== "object" ||
                current[segment] === null
            ) {
                current[segment] = nextIsIndex ? [] : {};
            }
            current = current[segment];
        }
    }

    const last = path[path.length - 1];
    if (typeof last === "number") {
        if (!Array.isArray(current)) {
            return;
        }
        current[last] = value;
    } else {
        current[last] = value;
    }
}

function deleteByPath(target: any, path: JsonPointerPath) {
    if (path.length === 0) {
        return;
    }

    let current = target;
    for (let i = 0; i < path.length - 1; i++) {
        const segment = path[i];
        if (typeof segment === "number") {
            if (!Array.isArray(current)) {
                return;
            }
            current = current[segment];
        } else {
            if (
                typeof current[segment] !== "object" ||
                current[segment] === null
            ) {
                return;
            }
            current = current[segment];
        }

        if (typeof current === "undefined" || current === null) {
            return;
        }
    }

    const last = path[path.length - 1];
    if (typeof last === "number") {
        if (!Array.isArray(current)) {
            return;
        }
        current.splice(last, 1);
    } else {
        if (
            typeof current === "object" &&
            current !== null &&
            Object.prototype.hasOwnProperty.call(current, last)
        ) {
            delete current[last];
        }
    }
}

export function reconstructBeforeAfterForDefinition(
    currentDefinition: any,
    ops: DiffEntry[],
): { before: any; after: any } {
    const after = currentDefinition;
    const before = cloneDeep(after);

    for (const entry of ops) {
        const path = parseJsonPointer(entry.path, currentDefinition.hash);

        if (path.length === 0) {
            if (entry.op === "edit" || entry.op === "del") {
                return {
                    before: entry.old,
                    after,
                };
            }

            if (entry.op === "add") {
                return {
                    before: null,
                    after,
                };
            }
        }

        if (entry.op === "add") {
            deleteByPath(before, path);
        } else if (entry.op === "edit") {
            setByPath(before, path, entry.old);
        } else if (entry.op === "del") {
            setByPath(before, path, entry.old);
        }
    }

    return { before, after };
}
