import fetch from "node-fetch";
import fs from "fs";
import { JSDOM } from "jsdom";
import "./extensions/string.extensions.js";

// https://gunici-prp.epias.com.tr/gunici-service/technical/tr/index.html
// https://seffaflik.epias.com.tr/transparency/technical/tr/index.html
// https://gunici-prp.epias.com.tr/gunici-trading-service/technical/tr/index.html

const OBJECT_BLUEPRINT = "class";
// const TARGET_URL = "https://gunici-prp.epias.com.tr/gunici-trading-service/technical/tr/index.html";
const OUTPUT_DIRECTORY_PATH = "outputs";
// const OUTPUT_FILE_PATH = `${OUTPUT_DIRECTORY_PATH}/output_${new URL(TARGET_URL).hostname}_${new Date().getTime()}.cs`;
const DEFAULT_NAME_CASE_METHOD = "toCamelCase";
const INCLUDE_DESCRIPTIONS = true;

let output = "";

const app = async () => {
    const docUrls = [
        "https://gunici-prp.epias.com.tr/gunici-service/technical/tr/index.html",
        "https://seffaflik.epias.com.tr/transparency/technical/tr/index.html",
        "https://gunici-prp.epias.com.tr/gunici-trading-service/technical/tr/index.html",
    ];

    if (!fs.existsSync(OUTPUT_DIRECTORY_PATH)) fs.mkdirSync(OUTPUT_DIRECTORY_PATH);
    for (const docUrl of docUrls) {
        await convertDocDefinitions(docUrl);
    }
};

const convertDocDefinitions = async (targetUrl: string) => {
    const outputFilePath = `${OUTPUT_DIRECTORY_PATH}/output_${new URL(targetUrl).hostname}_${new Date().getTime()}.cs`;

    const response = await fetch(targetUrl);
    console.log(`FETCHED: ${targetUrl}`);

    const htmlString = await response.text();

    const dom = new JSDOM(htmlString);
    const document = dom.window.document;

    const sect1s = document.querySelectorAll("div.sect1");

    const definitionsSect = [...sect1s.values()].find((sect) => sect.querySelector("#_definitions"));
    const definitions = definitionsSect.querySelectorAll(".sectionbody .sect2");

    for (const definition of definitions) {
        const properties = [];

        const table = definition.querySelector("table");
        if (table === null) continue;
        Array.from(table.tBodies[0].rows).forEach((row) => {
            const name = row.cells[0].querySelector("strong").textContent.trim()[DEFAULT_NAME_CASE_METHOD]();
            const isOptional = row.cells[0].querySelector("em").textContent.trim() === "opsiyonel";
            if (row.cells.length === 3) {
                const description = row.cells[1].textContent.trim().replace("\n", " ");
                const type = typeConverter(row.cells[2].textContent.trim(), name);
                properties.push({ name, isOptional, description, type });
            } else {
                const type = typeConverter(row.cells[1].textContent.trim(), name);
                properties.push({ name, isOptional, type });
            }
        });

        const className = definition.querySelector("h3").textContent.split(" ").at(-1).trim();
        const classCode = `public ${OBJECT_BLUEPRINT} ${className} {\n${properties
            .map((prop) => {
                let propDef = `  public ${prop.type}${prop.isOptional && prop.type !== "string" ? "?" : ""} ${
                    prop.name
                } { get; set; }`;

                if (INCLUDE_DESCRIPTIONS && prop.description && prop.description.length > 0)
                    return propDef + ` // ${prop.description}`;
                return propDef;
            })
            .join("\n")}\n}\n\n`;

        output += classCode;
    }

    console.log("Writing...");
    fs.writeFileSync(outputFilePath, output);
    console.log("DONE");
};

const typeConverter = (type: string, propName: string) => {
    const arrayTypeRegex = /<(.+)> array/;
    const arrayTypeMatch = type.match(arrayTypeRegex);
    if (arrayTypeMatch && arrayTypeMatch.length > 0) {
        let typeString = arrayTypeMatch[1].trim();

        if (typeString.includes("enum (")) return `${createAndGetEnum(typeString, propName)}[]`;
        return `${getKnownType(typeString)}[]`;
    }

    const mapTypeRegex = /<(.+)> map/;
    const mapTypeMatch = type.match(mapTypeRegex);
    if (mapTypeMatch && mapTypeMatch.length > 0) {
        let typeString = mapTypeMatch[1].trim();
        let [type1, type2] = typeString.split(",").map((s) => s.trim());

        if (type2.includes("enum (")) type2 = createAndGetEnum(typeString, propName);
        return `Dictionary<${getKnownType(type1)}, ${getKnownType(type2)}>`;
    }

    if (type.includes("enum (")) return createAndGetEnum(type, propName);

    return getKnownType(type);
};

const getKnownType = (type: string) => {
    switch (type) {
        case "string (date-time)":
        case "string(date-time)":
            return "DateTime";
        case "integer (int64)":
        case "integer(int64)":
            return "long";
        case "integer (int32)":
        case "integer(int32)":
            return "int";
        case "number (double)":
        case "number(double)":
        case "number":
            return "decimal";
        case "boolean":
            return "bool";
        default:
            return type.replace(/\s/g, "");
    }
};

const createAndGetEnum = (enumString: string, propName: string) => {
    const enumTypeRegex = /\((.+)\)/;
    const enumTypeMatch = enumString.match(enumTypeRegex);
    if (enumTypeMatch && enumTypeMatch.length > 0) {
        const enums = enumTypeMatch[1].split(",").map((s) => s.trim());

        const enumName = propName.capitalizeFirstLetter();
        const classCode = `public enum ${enumName} {\n${enums.map((e) => `${e},`).join("\n")}\n}\n\n`;

        output += classCode;
        return enumName;
    }
};

app();
