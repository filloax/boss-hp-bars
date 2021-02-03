import { Constants } from "./constants.js";

var localize = (s) => Constants.MOD_NAME + "." + s;

export const registerSettings = function () {
    game.settings.register(Constants.MOD_NAME, "debug-enabled", {
        name: localize("settings.debug.name"),
        hint: localize("settings.debug.label"),
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
    });
    
    game.settings.register(Constants.MOD_NAME, "anim-block-update", {
        name: localize("settings.anim-block-update.name"),
        hint: localize("settings.anim-block-update.label"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

}