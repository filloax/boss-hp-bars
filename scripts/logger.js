import { Constants } from "./constants.js";

export class Logger {
    static log(...args) {
        console.log("Dark Souls Boss Bars |", ...args)
    }

    static error(...args) {
        console.error("Dark Souls Boss Bars | Error:", ...args)
    }

    static debug(...args) {
        if (game.settings.get(Constants.MOD_NAME, "debug-enabled")) {
            Logger.log("Debug:", ...args);
        }
    }
}