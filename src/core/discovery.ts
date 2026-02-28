import { JSDOM } from "jsdom";
import { fetchWithTimeout } from "./http.js";

export interface DiscoveredDocPage {
    title: string;
    url: string;
}

export interface DocumentationDiscoveryResult {
    pages: DiscoveredDocPage[];
    failedSeedUrls: string[];
}

const normalizeUrl = (rawUrl: string, baseUrl: string): string | null => {
    try {
        return new URL(rawUrl, baseUrl).toString();
    } catch {
        return null;
    }
};

const getPageTitle = (document: any, fallbackUrl: string): string => {
    return (
        document.querySelector("h1")?.textContent?.trim() ||
        document.querySelector("title")?.textContent?.trim() ||
        fallbackUrl
    );
};

const discoverFromSeedUrl = async (seedUrl: string): Promise<DiscoveredDocPage[]> => {
    const response = await fetchWithTimeout(seedUrl);
    if (!response.ok) return [];

    const htmlString = await response.text();
    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    const pages = new Map<string, DiscoveredDocPage>();

    pages.set(seedUrl, {
        title: getPageTitle(document, seedUrl),
        url: seedUrl,
    });

    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"));

    for (const link of links) {
        const normalizedUrl = normalizeUrl(link.href, seedUrl);
        if (!normalizedUrl) continue;

        if (!normalizedUrl.includes("/technical/") || !normalizedUrl.endsWith("index.html")) {
            continue;
        }

        if (pages.has(normalizedUrl)) continue;

        const linkTitle = link.textContent?.trim() || normalizedUrl;
        pages.set(normalizedUrl, {
            title: linkTitle,
            url: normalizedUrl,
        });
    }

    return [...pages.values()];
};

export const discoverDocumentationPages = async (seedUrls: string[]): Promise<DocumentationDiscoveryResult> => {
    const settledResults = await Promise.allSettled(seedUrls.map((seedUrl) => discoverFromSeedUrl(seedUrl)));

    const discoveredPages = new Map<string, DiscoveredDocPage>();
    const failedSeedUrls: string[] = [];

    settledResults.forEach((result, index) => {
        if (result.status !== "fulfilled") {
            failedSeedUrls.push(seedUrls[index]);
            return;
        }

        for (const page of result.value) {
            if (!discoveredPages.has(page.url)) {
                discoveredPages.set(page.url, page);
            }
        }
    });

    return {
        pages: [...discoveredPages.values()].sort((a, b) => a.title.localeCompare(b.title)),
        failedSeedUrls,
    };
};
