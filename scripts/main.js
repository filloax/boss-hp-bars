import { BossHpBarsContainer } from './bossHpBarsContainer.js';
import { Constants } from './constants.js';
import { Logger } from './logger.js';
import { registerSettings } from './settings.js';
import { TokenBossBarSettings } from './tokenBossBarSettings.js';

async function preloadHandlebarTemplates() {
    const paths = [
        'modules/' + Constants.MOD_NAME + '/templates/container.hbs',
        'modules/' + Constants.MOD_NAME + '/templates/bossBar.hbs',
    ];

    loadTemplates(paths);
    
    Logger.debug("Loaded handlebar templates!", paths);
}

Hooks.on("init", () => {
    registerSettings();
    preloadHandlebarTemplates();
    Logger.log("Initialized!")
});

Hooks.on("ready", () => {
    Hooks.on('renderTokenHUD', (app, html, data) => { 
        if (game.users.current.role >= game.settings.get(Constants.MOD_NAME, "min-button-role")) {
            TokenBossBarSettings.addBossBarButton(app, html, data) 
        }
    });
});

Hooks.on('canvasReady', async () => {
    Logger.debug("Readying canvas!")

    if (!game.bossHpBars) {
        game.bossHpBars = new BossHpBarsContainer();

        Hooks.on('updateToken', (token, diff, options, userId) => {
            Logger.debug("token", token, "diff", diff, "userId", userId)
            Logger.debug("-------")
            if (game.bossHpBars.checkRelevantTokenChange(token, diff))
                game.bossHpBars.update();
        });

        Hooks.on('updateActor', (actor, diff, options, userId) => {
            Logger.debug("actor", actor, "diff", diff, "userId", userId)
            Logger.debug("-------")
            if (game.bossHpBars.checkRelevantActorChange(actor, diff))
                game.bossHpBars.update();
        });

        Hooks.on('createToken', (token, options, userId) => {
            Logger.debug("create: token", token, "userId", userId)
            Logger.debug("-------")
            setTimeout(() => {
                if (game.bossHpBars.checkRelevantTokenChange(token, token, true))
                    game.bossHpBars.update();
            }, 5);
        });

        Hooks.on('deleteToken', (token, options, userId) => {
            Logger.debug("delete: token", token, "diff", diff, "userId", userId)
            Logger.debug("-------")
            game.bossHpBars.tryDeleteBar(token);
        });

        Hooks.on('renderBossHpBarsContainer', () => {
            game.bossHpBars.postRender();
            Logger.debug("Done rendering boss bars");
        })

        Hooks.on('collapseSidebar', () => {
            game.bossHpBars.update();
            Logger.debug("Sidebar collpase hook done");
        })
    }

    game.bossHpBars.checkFlagChanges = true;
    game.bossHpBars.update();

    Logger.debug("Readied canvas!")
})