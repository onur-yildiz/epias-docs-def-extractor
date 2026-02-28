import { JSDOM } from "jsdom";
import { fetchWithTimeout } from "./http.js";

export interface DiscoveredDocPage {
    title: string;
    url: string;
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

export const discoverDocumentationPages = async (seedUrls: string[]): Promise<DiscoveredDocPage[]> => {
    const discoveredPages = new Map<string, DiscoveredDocPage>();

    for (const seedUrl of seedUrls) {
        let response;

        try {
            response = await fetchWithTimeout(seedUrl);
        } catch {
            continue;
        }

        if (!response.ok) continue;

        const htmlString = await response.text();
        const dom = new JSDOM(htmlString);
        const document = dom.window.document;

        discoveredPages.set(seedUrl, {
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

            if (discoveredPages.has(normalizedUrl)) continue;

            const linkTitle = link.textContent?.trim() || normalizedUrl;
            discoveredPages.set(normalizedUrl, {
                title: linkTitle,
                url: normalizedUrl,
            });
        }
    }

    return [...discoveredPages.values()].sort((a, b) => a.title.localeCompare(b.title));
};
