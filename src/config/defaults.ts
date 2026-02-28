export const KNOWN_DOC_URLS = [
    "https://gunici-prp.epias.com.tr/gunici-service/technical/tr/index.html",
    "https://seffaflik.epias.com.tr/transparency/technical/tr/index.html",
    "https://gunici-prp.epias.com.tr/gunici-trading-service/technical/tr/index.html",
] as const;

export const DEFAULT_OUTPUT_DIRECTORY_PATH = "outputs";
export const DEFAULT_OBJECT_BLUEPRINT = "class";
export const DEFAULT_NAME_CASE_METHOD = "toPascalCase" as const;
export const DEFAULT_INCLUDE_DESCRIPTIONS = true;
export const DEFAULT_DESCRIPTION_COMMENT_STYLE = "inline" as const;

export const DEFAULT_DOC_URLS = [...KNOWN_DOC_URLS] as const;
