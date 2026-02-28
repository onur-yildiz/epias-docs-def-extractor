import { checkbox } from "@inquirer/prompts";
import { DiscoveredDocPage } from "../core/discovery.js";
import { formatSelectableDocPage } from "./ui.js";

export const selectDocumentationPages = async (pages: DiscoveredDocPage[]): Promise<string[]> => {
    if (pages.length === 0) return [];

    return checkbox({
        message: "Select documentation pages to extract",
        choices: pages.map((page) => ({
            name: formatSelectableDocPage(page.title, page.url),
            value: page.url,
            checked: true,
        })),
        required: true,
    });
};
