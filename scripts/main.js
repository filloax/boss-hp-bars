import { BossHpBars } from './bossHpBar.js';
import { Constants } from './constants.js';
import { Logger } from './logger.js';

console.log("Hello World! This code runs immediately when the file is loaded.");

async function preloadHandlebarTemplates() {
    const paths = [
        '/modules/' + Constants.MOD_NAME + '/templates/template.hbs',
    ];

    loadTemplates(paths);
    
    Logger.debug("Loaded handlebar templates!");
}

Hooks.on("init", () => {
    preloadHandlebarTemplates();
    Logger.debug("Initialized!")
});

// Hooks.on("ready", () => {
// });

Hooks.on('canvasReady', async () => {
    Logger.debug("Readying canvas!")

    if (!game.bossHpBars) {
        game.bossHpBars = new BossHpBars();

        Hooks.on('updateToken', (scene, token, diff, options, idUser) => {
            Logger.debug("token", token, "diff", diff, "idUser", idUser)
            Logger.debug("-------")
            if (game.bossHpBars.checkRelevantTokenChange(token, diff))
                game.bossHpBars.update();
        });

        Hooks.on('updateActor', (actor, diff, options, idUser) => {
            Logger.debug("actor", actor, "diff", diff, "idUser", idUser)
            Logger.debug("-------")
            if (game.bossHpBars.checkRelevantActorChange(actor, diff))
                game.bossHpBars.update();
        });

        Hooks.on('renderBossHpBars', () => {
            game.bossHpBars?.postRender();
            Logger.debug("Done rendering boss bars");
        })
    }

    game.bossHpBars.checkFlagChanges = true;
    game.bossHpBars.update();

    Logger.debug("Readied canvas!")
})