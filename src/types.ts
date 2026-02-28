export type NameCaseMethod = "toCamelCase" | "toPascalCase" | "toSnakeCase";

export interface AppConfig {
    docUrls: string[];
    outputDirectoryPath: string;
    objectBlueprint: string;
    defaultNameCaseMethod: NameCaseMethod;
    includeDescriptions: boolean;
}

export interface PropertyDefinition {
    name: string;
    isOptional: boolean;
    type: string;
    description?: string;
}
