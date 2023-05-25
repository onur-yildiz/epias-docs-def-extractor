# epias-docs-def-extractor
Extracts definitions from EPIAS Docs as C# classes

- In `index.ts` add your epias documentation url into docUrls. (To be interactive cmd app in the future hopefully. If I have the time.)
- Run `npm start`

## Parameters (in `index.ts`)\
`DEFAULT_NAME_CASE_METHOD` - __toCamelCase__, __toPascalCase__, __toSnakeCase__\
`INCLUDE_DESCRIPTIONS` - include desc as comments (To be doc summary in the future hopefully)\
`OUTPUT_DIRECTORY_PATH` - output path\
`OBJECT_BLUEPRINT` - class, struct etc.
