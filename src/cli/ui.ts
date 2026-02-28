const color = {
    cyan: (text: string) => `\x1b[36m${text}\x1b[0m`,
    green: (text: string) => `\x1b[32m${text}\x1b[0m`,
    yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
    blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
    bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

export const formatSelectableDocPage = (title: string, url: string): string => {
    return `${title} [${url}]`;
};

export const printBanner = (): void => {
    const title = "EPIAS Docs Definition Extractor";
    const line = "═".repeat(title.length + 4);
    console.log(color.cyan(`╔${line}╗`));
    console.log(color.cyan(`║  ${color.bold(title)}  ║`));
    console.log(color.cyan(`╚${line}╝`));
};

export const createSpinner = (text: string) => {
    const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let frameIndex = 0;

    process.stdout.write(`${color.cyan(frames[frameIndex])} ${text}`);
    const interval = setInterval(() => {
        frameIndex = (frameIndex + 1) % frames.length;
        process.stdout.write(`\r${color.cyan(frames[frameIndex])} ${text}`);
    }, 80);

    const stop = (symbol: string, message: string) => {
        clearInterval(interval);
        process.stdout.write(`\r${symbol} ${message}\n`);
    };

    return {
        stop: (message: string) => stop(color.green("✔"), message),
        fail: (message: string) => stop("✖", message),
    };
};

export const logInfo = (text: string): void => {
    console.log(`${color.blue("ℹ")} ${text}`);
};

export const logSuccess = (text: string): void => {
    console.log(`${color.green("✔")} ${text}`);
};

export const logWarn = (text: string): void => {
    console.log(`${color.yellow("⚠")} ${text}`);
};
