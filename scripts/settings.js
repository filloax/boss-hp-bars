import { Constants } from "./constants.js";
import { Logger } from "./logger.js";

var localize = (s) => Constants.MOD_NAME + "." + s;
const name = Constants.MOD_NAME

function updateHud() {    
    Logger.debug("UI settings changed, updating...")
    game.bossHpBars.update()
}

export const registerSettings = function () {
    game.settings.register(name, "debug-enabled", {
        name: localize("settings.debug.name"),
        hint: localize("settings.debug.label"),
        scope: "client",
        config: true,
        default: true,
        type: Boolean,
    });
    
    game.settings.register(name, "anim-block-update", {
        name: localize("settings.anim-block-update.name"),
        hint: localize("settings.anim-block-update.label"),
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register(name, "pos-offset-x", {
        name: localize("settings.pos-offset-x.name"),
        hint: localize("settings.pos-offset-x.label"),
        scope: "client",
        config: true,
        default: 0,
        type: Number,
        onChange: value => { updateHud(value); }
    });
    game.settings.register(name, "pos-offset-y", {
        name: localize("settings.pos-offset-y.name"),
        hint: localize("settings.pos-offset-y.label"),
        scope: "client",
        config: true,
        default: 0,
        type: Number,
        onChange: value => { updateHud(value); }
    });

    game.settings.register(name, 'scale', {
        name: localize('settings.scale.name'),
        hint: localize('settings.scale.label'),
        scope: 'client',
        config: true,
        type: Number,
        range: {     
          min: 0.5,
          max: 2,
          step: 0.1
        },
        default: 1,
        onChange: value => { updateHud(value); }
    });

    game.settings.register(name, 'scale-bar-x', {
        name: localize('settings.scale-bar-x.name'),
        hint: localize('settings.scale-bar-x.label'),
        scope: 'client',
        config: true,
        type: Number,
        range: {     
          min: 0.5,
          max: 2,
          step: 0.1
        },
        default: 1,
        onChange: value => { updateHud(value); }
    });

    game.settings.register(name, "g-pos-offset-x", {
        name: localize("settings.g-pos-offset-x.name"),
        hint: localize("settings.g-pos-offset-x.label"),
        scope: "client",
        config: true,
        default: 0,
        type: Number,
        onChange: value => { updateHud(value); }
    });
    game.settings.register(name, "g-pos-offset-y", {
        name: localize("settings.g-pos-offset-y.name"),
        hint: localize("settings.g-pos-offset-y.label"),
        scope: "world",
        config: true,
        default: 0,
        type: Number,
        onChange: value => { updateHud(value); }
    });

    game.settings.register(name, 'g-scale', {
        name: localize('settings.g-scale.name'),
        hint: localize('settings.g-scale.label'),
        scope: 'world',
        config: true,
        type: Number,
        range: {     
          min: 0.5,
          max: 2,
          step: 0.1
        },
        default: 1,
        onChange: value => { updateHud(value); }
    });

    game.settings.register(name, 'g-scale-bar-x', {
        name: localize('settings.g-scale-bar-x.name'),
        hint: localize('settings.g-scale-bar-x.label'),
        scope: 'world',
        config: true,
        type: Number,
        range: {     
          min: 0.5,
          max: 2,
          step: 0.1
        },
        default: 1,
        onChange: value => { updateHud(value,); }
    });

    const roles = Object.entries(CONST.USER_ROLES)
    .filter(([key, val]) => val !== 0)
    .reduce((roles2, [permission, val]) => {
        roles2[val] = permission;
        return roles2;
    }, {});
	game.settings.register(name, "min-button-role", {
        name: localize('settings.min-button-role.name'),
        hint: localize('settings.min-button-role.label'),
        default: CONST.USER_ROLES.ASSISTANT,
        config: true,
        isSelect: true,
        choices: roles,
        type: Number,
        scope: "world"
    });
}