import { checkbox, confirm, input } from "@inquirer/prompts";
import { DiscoveredDocPage } from "../core/discovery.js";
import { formatSelectableDocPage } from "./ui.js";

const isValidUrl = (value: string): boolean => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

const askForAdditionalUrls = async (): Promise<string[]> => {
    const additionalUrls: string[] = [];

    while (
        await confirm({
            message: "➕ Add another documentation URL?",
            default: false,
        })
    ) {
        const customUrl = await input({
            message: "Enter documentation URL",
            validate: (value) => {
                if (!value || value.trim().length === 0) {
                    return "URL is required";
                }

                return isValidUrl(value.trim()) ? true : "Please enter a valid absolute URL";
            },
        });

        additionalUrls.push(customUrl.trim());
    }

    return additionalUrls;
};

export const selectDocumentationPages = async (pages: DiscoveredDocPage[]): Promise<string[]> => {
    const selectedFromDiscovery =
        pages.length === 0
            ? []
            : await checkbox({
                  message: "📚 Select documentation pages to extract",
                  choices: pages.map((page) => ({
                      name: formatSelectableDocPage(page.title, page.url),
                      value: page.url,
                      checked: true,
                  })),
              });

    const additionalUrls = await askForAdditionalUrls();

    return [...new Set([...selectedFromDiscovery, ...additionalUrls])];
};
