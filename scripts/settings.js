import { Constants } from "./constants.js";

var localize = (s) => game.i18n.localize(Constants.MOD_NAME + "." + s);

export const registerSettings = function () {
    game.settings.register(Constants.MOD_NAME, "debug-enabled", {
        name: localize("settings.debug"),
        // hint: localize("settings.debug"),
        scope: "user",
        config: true,
        default: true,
        type: Boolean,
    });
}