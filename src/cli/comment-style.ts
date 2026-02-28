import { select } from "@inquirer/prompts";
import { DescriptionCommentStyle } from "../types.js";

export const selectDescriptionCommentStyle = async (): Promise<DescriptionCommentStyle> => {
    return select({
        message: "Description comment style",
        choices: [
            {
                name: "Inline comments (property // description)",
                value: "inline",
            },
            {
                name: "XML summary comments (/// <summary>)",
                value: "xmlSummary",
            },
        ],
        default: "inline",
    });
};
