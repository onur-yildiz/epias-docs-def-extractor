# epias-docs-def-extractor

A reusable CLI application that extracts object definitions from EPIAS technical documentation pages and generates C# model files.

## Install

```bash
npm install
```

## Run

```bash
npm start
```

## CLI usage

```bash
node dist/index.js [options]
```

Options:

- `-u, --url <url...>`: One or more target documentation URLs.
- `-o, --output <dir>`: Output directory path. Default: `outputs`
- `-b, --blueprint <type>`: C# type blueprint (`class`, `struct`, etc.). Default: `class`
- `-c, --case <method>`: Property name case method (`toCamelCase`, `toPascalCase`, `toSnakeCase`). Default: `toCamelCase`
- `-d, --include-descriptions <boolean>`: Include inline comments from descriptions. Default: `true`

### Example

```bash
npm run build
node dist/index.js \
  --url https://gunici-prp.epias.com.tr/gunici-service/technical/tr/index.html \
  --output outputs \
  --blueprint class \
  --case toPascalCase \
  --include-descriptions true
```
