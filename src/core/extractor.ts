import fs from "fs";
import { JSDOM } from "jsdom";
import { AppConfig, PropertyDefinition } from "../types.js";
import { TypeMapper } from "./type-mapper.js";
import { fetchWithTimeout } from "./http.js";

export class DefinitionExtractor {
    private readonly typeMapper = new TypeMapper();

    public constructor(private readonly config: AppConfig) {}

    public ensureOutputDirectory(): void {
        if (!fs.existsSync(this.config.outputDirectoryPath)) {
            fs.mkdirSync(this.config.outputDirectoryPath);
        }
    }

    public async convertDocDefinitions(targetUrl: string): Promise<{ outputFilePath: string; classCount: number }> {
        const outputChunks: string[] = [];
        const outputFilePath = `${this.config.outputDirectoryPath}/output_${new URL(targetUrl).hostname}_${new Date().getTime()}.cs`;

        const response = await fetchWithTimeout(targetUrl);
        const htmlString = await response.text();

        const dom = new JSDOM(htmlString);
        const document = dom.window.document;

        const sect1s = document.querySelectorAll("div.sect1");
        const definitionsSect = [...sect1s.values()].find((sect) => sect.querySelector("#_definitions"));

        if (!definitionsSect) {
            fs.writeFileSync(outputFilePath, "");
            return { outputFilePath, classCount: 0 };
        }

        const definitions = definitionsSect.querySelectorAll(".sectionbody .sect2");
        let classCount = 0;

        for (const definition of definitions) {
            const properties: PropertyDefinition[] = [];
            const table = definition.querySelector("table");
            if (table === null || table.tBodies.length === 0) continue;

            Array.from(table.tBodies[0].rows).forEach((row) => {
                const name = row.cells[0].querySelector("strong")?.textContent?.trim()?.[this.config.defaultNameCaseMethod]?.();
                const isOptional = row.cells[0].querySelector("em")?.textContent?.trim() === "opsiyonel";

                if (!name) return;

                if (row.cells.length === 3) {
                    const description = row.cells[1].textContent.trim().replace(/\s+/g, " ");
                    const type = this.typeMapper.convert(row.cells[2].textContent.trim(), name, (code) => outputChunks.push(code));
                    properties.push({ name, isOptional, description, type });
                } else {
                    const type = this.typeMapper.convert(row.cells[1].textContent.trim(), name, (code) => outputChunks.push(code));
                    properties.push({ name, isOptional, type });
                }
            });

            const className = definition.querySelector("h3")?.textContent?.split(" ").at(-1)?.trim();
            if (!className) continue;

            const classCode = `public ${this.config.objectBlueprint} ${className}\n{\n${properties
                .map((prop) => this.buildPropertyDefinition(prop))
                .join("\n\n")}\n}`;

            outputChunks.push(classCode);
            classCount += 1;
        }

        fs.writeFileSync(outputFilePath, this.formatCSharpOutput(outputChunks));
        return { outputFilePath, classCount };
    }

    private buildPropertyDefinition(prop: PropertyDefinition): string {
        const propDef = `public ${prop.type}${prop.isOptional && prop.type !== "string" ? "?" : ""} ${prop.name} { get; set; }`;

        if (!this.config.includeDescriptions || !prop.description || prop.description.length === 0) {
            return `    ${propDef}`;
        }

        if (this.config.descriptionCommentStyle === "xmlSummary") {
            const escapedDescription = this.escapeXmlComment(prop.description);
            return `    /// <summary>\n    /// ${escapedDescription}\n    /// </summary>\n    ${propDef}`;
        }

        return `    ${propDef} // ${prop.description}`;
    }

    private formatCSharpOutput(chunks: string[]): string {
        const rawCode = chunks.join("\n\n").trim();
        if (rawCode.length === 0) return "";

        const withNormalizedSpacing = rawCode
            .replace(/[ \t]+$/gm, "")
            .replace(/\n{3,}/g, "\n\n")
            .trim();

        return `${withNormalizedSpacing}\n`;
    }

    private escapeXmlComment(value: string): string {
        return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}
