interface String {
    capitalizeFirstLetter(): string;
    toCamelCase(): string;
    toPascalCase(): string;
    toSnakeCase(): string;
}

Object.defineProperty(String.prototype, "capitalizeFirstLetter", {
    value: function capitalizeFirstLetter() {
        return this.charAt(0).toUpperCase() + this.slice(1);
    },
    writable: true,
    configurable: true,
});

Object.defineProperty(String.prototype, "toCamelCase", {
    value: function (): string {
        return this.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()).replace(/_([a-z])/g, (_, letter) =>
            letter.toUpperCase()
        );
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(String.prototype, "toPascalCase", {
    value: function (): string {
        return this.toCamelCase().replace(/^[a-z]/, (letter) => letter.toUpperCase());
    },
    enumerable: false,
    configurable: true,
});

Object.defineProperty(String.prototype, "toSnakeCase", {
    value: function (): string {
        return this.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
    },
    enumerable: false,
    configurable: true,
});
