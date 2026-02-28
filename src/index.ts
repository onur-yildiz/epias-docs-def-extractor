import "./extensions/string.extensions.js";
import { parseAppConfig } from "./cli/options.js";
import { createSpinner, logInfo, logSuccess, logWarn, printBanner } from "./cli/ui.js";
import { DefinitionExtractor } from "./core/extractor.js";

const app = async (): Promise<void> => {
    printBanner();

    const config = parseAppConfig();
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
