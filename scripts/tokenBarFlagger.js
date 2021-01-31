import { Constants } from './constants.js';

class TokenBarFlagger {
    /**
     * Set whether the token should be linked to a boss bar in the screen
     * @param {Token} token
     * @param {boolean} value 
     */
    static setTokenBossBar(token, value) {
        token.setFlag(Constants.MOD_NAME, "has-bar", value)
    }

    /**
     * @param {Token} token
     * @return {boolean}
     */
    static hasTokenBossBar(token) {
        return token?.getFlag(Constants.MOD_NAME, "has-bar")
    }

    /**
     * Returns all tokens in the scene with the boss bar flag set
     * @return {Array<Token>}
     */
    static getTokensInSceneWithBar() {
        return canvas.tokens.placeables.filter(TokenBarFlagger.hasTokenBossBar);
    }
}

export { TokenBarFlagger };