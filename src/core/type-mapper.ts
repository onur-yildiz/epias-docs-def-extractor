export class TypeMapper {
    public convert(type: string, propName: string, appendOutput: (code: string) => void): string {
        const arrayTypeRegex = /<(.+)> array/;
        const arrayTypeMatch = type.match(arrayTypeRegex);
        if (arrayTypeMatch && arrayTypeMatch.length > 0) {
            const typeString = arrayTypeMatch[1].trim();

            if (typeString.includes("enum (")) return `${this.createAndGetEnum(typeString, propName, appendOutput)}[]`;
            return `${this.getKnownType(typeString)}[]`;
        }

        const mapTypeRegex = /<(.+)> map/;
        const mapTypeMatch = type.match(mapTypeRegex);
        if (mapTypeMatch && mapTypeMatch.length > 0) {
            const typeString = mapTypeMatch[1].trim();
            let [type1, type2] = typeString.split(",").map((s) => s.trim());

            if (type2.includes("enum (")) type2 = this.createAndGetEnum(typeString, propName, appendOutput);
            return `Dictionary<${this.getKnownType(type1)}, ${this.getKnownType(type2)}>`;
        }

        if (type.includes("enum (")) return this.createAndGetEnum(type, propName, appendOutput);

        return this.getKnownType(type);
    }

    private getKnownType(type: string): string {
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
    }

    private createAndGetEnum(enumString: string, propName: string, appendOutput: (code: string) => void): string {
        const enumTypeRegex = /\((.+)\)/;
        const enumTypeMatch = enumString.match(enumTypeRegex);
        if (enumTypeMatch && enumTypeMatch.length > 0) {
            const enums = enumTypeMatch[1].split(",").map((s) => s.trim());
            const enumName = propName.capitalizeFirstLetter();
            const classCode = `public enum ${enumName} {\n${enums.map((e) => `${e},`).join("\n")}\n}\n\n`;

            appendOutput(classCode);
            return enumName;
        }

        return "string";
    }
}
