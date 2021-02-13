import { Constants } from './constants.js';

class TokenBossBarSettings {
    /**
     * Set whether the token should be linked to a boss bar in the screen
     * @param {Token} token
     * @param {boolean} value 
     */
    static setTokenBossBar(token, value) {
        token.setFlag(Constants.MOD_NAME, "has-bar", value)
    }

    /**
     * @param {Token|Token.data} token
     * @return {boolean}
     */
    static hasTokenBossBar(token) {
        return token?.getFlag?.(Constants.MOD_NAME, "has-bar") || token?.flags?.[Constants.MOD_NAME]?.["has-bar"]
    }

    // called in hook in main.js
    static async addBossBarButton(app, html, data) {
        let token = app.object;
        let wasBarActive = hasTokenBossBar(token);

        let barbutton = $(`<div class="control-icon bossbar-btn"><i class="fas fa-bars"></i></div>`);
        if (wasBarActive) {
            barbutton.addClass("active");
        }

        html.find('.col.right').prepend(barbutton);
        barbutton.find('i').click(async (ev) => { //click handler
            let isBarActive = hasTokenBossBar(token);
            let btn = $(ev.currentTarget.parentElement);
            ev.preventDefault();
            ev.stopPropagation();

            ui.notifications.info("Premuto pulsante!");
            token.setFlag(Constants.MOD_NAME, "has-bar", !isBarActive);

            if (!isBarActive) {
                barbutton.addClass("active");
            } else {
                barbutton.removeClass("active");
            }
        });
    }

    /**
     * Returns all tokens in the scene with the boss bar flag set
     * @return {Array<Token>}
     */
    static getTokensInSceneWithBar() {
        return canvas.tokens.placeables.filter(TokenBossBarSettings.hasTokenBossBar);
    }
}

export { TokenBossBarSettings };