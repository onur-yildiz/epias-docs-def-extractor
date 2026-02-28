import {
    DEFAULT_DOC_URLS,
    DEFAULT_INCLUDE_DESCRIPTIONS,
    DEFAULT_NAME_CASE_METHOD,
    DEFAULT_OBJECT_BLUEPRINT,
    DEFAULT_OUTPUT_DIRECTORY_PATH,
} from "../config/defaults.js";
import { AppConfig, NameCaseMethod } from "../types.js";

const CASE_METHODS: NameCaseMethod[] = ["toCamelCase", "toPascalCase", "toSnakeCase"];

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
    if (value === undefined) return fallback;
    return value === "true";
};

const getValueAfterFlag = (args: string[], ...flags: string[]): string | undefined => {
    const index = args.findIndex((arg) => flags.includes(arg));
    if (index < 0 || index + 1 >= args.length) return undefined;
    return args[index + 1];
};

const getValuesAfterFlag = (args: string[], ...flags: string[]): string[] | undefined => {
    const index = args.findIndex((arg) => flags.includes(arg));
    if (index < 0 || index + 1 >= args.length) return undefined;

    const values: string[] = [];
    for (let i = index + 1; i < args.length && !args[i].startsWith("-"); i += 1) {
        values.push(args[i]);
    }

    return values.length > 0 ? values : undefined;
};

export const parseAppConfig = (args: string[] = process.argv.slice(2)): AppConfig => {
    const urls = getValuesAfterFlag(args, "-u", "--url");
    const hasCustomUrls = Boolean(urls && urls.length > 0);
    const outputDirectoryPath = getValueAfterFlag(args, "-o", "--output") ?? DEFAULT_OUTPUT_DIRECTORY_PATH;
    const objectBlueprint = getValueAfterFlag(args, "-b", "--blueprint") ?? DEFAULT_OBJECT_BLUEPRINT;
    const caseMethodCandidate = getValueAfterFlag(args, "-c", "--case");
    const includeDescriptions = parseBoolean(
        getValueAfterFlag(args, "-d", "--include-descriptions"),
        DEFAULT_INCLUDE_DESCRIPTIONS
    );

    return {
        docUrls: urls ?? [...DEFAULT_DOC_URLS],
        outputDirectoryPath,
        objectBlueprint,
        defaultNameCaseMethod: CASE_METHODS.includes(caseMethodCandidate as NameCaseMethod)
            ? (caseMethodCandidate as NameCaseMethod)
            : DEFAULT_NAME_CASE_METHOD,
        includeDescriptions,
        hasCustomUrls,
    };
};
