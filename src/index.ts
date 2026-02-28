import "./extensions/string.extensions.js";
import { parseAppConfig } from "./cli/options.js";
import { selectDocumentationPages } from "./cli/doc-selection.js";
import { createSpinner, logInfo, logSuccess, logWarn, printBanner } from "./cli/ui.js";
import { KNOWN_DOC_URLS } from "./config/defaults.js";
import { discoverDocumentationPages } from "./core/discovery.js";
import { DefinitionExtractor } from "./core/extractor.js";

const app = async (): Promise<void> => {
    printBanner();

    const config = parseAppConfig();

    if (!config.hasCustomUrls) {
        const discoverySpinner = createSpinner("Crawling EPIAS documentation pages");

        try {
            const { pages, failedSeedUrls } = await discoverDocumentationPages([...KNOWN_DOC_URLS]);
            discoverySpinner.stop(`Discovered ${pages.length} documentation page(s)`);

            if (failedSeedUrls.length > 0) {
                logWarn(`Crawl errors on ${failedSeedUrls.length} seed URL(s); continuing with available pages.`);
            }

            const selectedUrls = await selectDocumentationPages(pages);
            config.docUrls = selectedUrls;

            logInfo(`Selected URL count: ${config.docUrls.length}`);
        } catch (error) {
            discoverySpinner.fail("Unable to crawl documentation pages, using known URLs");
            logWarn(error instanceof Error ? error.message : "Unknown discovery error");
        }
    }

    const extractor = new DefinitionExtractor(config);
    extractor.ensureOutputDirectory();

    logInfo(`Target URL count: ${config.docUrls.length}`);
    logInfo(`Output directory: ${config.outputDirectoryPath}`);

    for (const docUrl of config.docUrls) {
        const spinner = createSpinner(`Fetching ${docUrl}`);

        try {
            const { outputFilePath, classCount } = await extractor.convertDocDefinitions(docUrl);
            if (classCount === 0) {
                logWarn(`No definition section found for ${docUrl}. Wrote current output to ${outputFilePath}`);
                continue;
            }
            spinner.stop(`Processed ${docUrl}`);
            logSuccess(`Extracted ${classCount} definitions from ${docUrl}`);
            logInfo(`Saved: ${outputFilePath}`);
        } catch (error) {
            spinner.fail(`Failed to process ${docUrl}`);
            throw error;
        }
    }

    logSuccess("Extraction completed.");
};

app();
