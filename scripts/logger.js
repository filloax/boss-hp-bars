export class Logger {
    static log(...args) {
        console.log("Dark Souls Boss Bars |", ...args)
    }

    static error(...args) {
        console.error("Dark Souls Boss Bars | Error:", ...args)
    }

    static debug(...args) {
        Logger.log("Debug:", ...args);
    }
}