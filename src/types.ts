export type NameCaseMethod = "toCamelCase" | "toPascalCase" | "toSnakeCase";
export type DescriptionCommentStyle = "inline" | "xmlSummary";

export interface AppConfig {
    docUrls: string[];
    outputDirectoryPath: string;
    objectBlueprint: string;
    defaultNameCaseMethod: NameCaseMethod;
    includeDescriptions: boolean;
    descriptionCommentStyle: DescriptionCommentStyle;
    hasCustomUrls: boolean;
    hasCustomDescriptionCommentStyle: boolean;
}

export interface PropertyDefinition {
    name: string;
    isOptional: boolean;
    type: string;
    description?: string;
}
