import { select } from "@inquirer/prompts";
import { NameCaseMethod } from "../types.js";

export const selectNameCaseMethod = async (): Promise<NameCaseMethod> => {
    return select({
        message: "Property naming case",
        choices: [
            {
                name: "PascalCase (PropertyName)",
                value: "toPascalCase",
            },
            {
                name: "camelCase (propertyName)",
                value: "toCamelCase",
            },
            {
                name: "snake_case (property_name)",
                value: "toSnakeCase",
            },
        ],
        default: "toPascalCase",
    });
};
