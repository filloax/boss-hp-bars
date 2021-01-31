import { Constants } from './constants.js';
import { Logger } from './logger.js';
import { TokenBarFlagger } from './tokenBarFlagger.js';

export class BossHpBars extends Application {
    checkFlagChanges = false;
    barData = {
        /** @type {Token} */
        token: null,
        value: null,
        max: null,
        barId: "bar1",
    };
    
    constructor() {
        super();
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'modules/' + Constants.MOD_NAME + '/templates/template.hbs',
            id: 'bosshpbars',
            classes: [],
            scale: 1,
            popOut: false,
            minimizable: false,
            resizable: true,
            title: 'bosshpbars',
            dragDrop: [],
            tabs: [],
            scrollY: []
        });
    }

    /** @override */
    getData(options = {}) {
        const data = super.getData();
        data.id = this.constructor.defaultOptions.id;
        data.width = ((this.barData.value || 1) / (this.barData.max || 1) * 100) + "%";
        data.bossName = this.barData.token?.name || "";
        Logger.debug('HUD data:', data);
        return data;
    }

    update() {
        Logger.debug("Updating bars")

        //If flags were changed before, check valid tokens
        if (this.checkFlagChanges) {
            if (!this.isBarTokenGood()) {
                Logger.debug("Boss token no longer has boss flag")
                this.barData.token = null;
            }

            this.barData.token = TokenBarFlagger.getTokensInSceneWithBar()[0];
        }

        let barAttribute = this.barData.token?.getBarAttribute(this.barData.barId);
        this.barData.value = barAttribute?.value;
        this.barData.max = barAttribute?.max;

        if (!this.shouldRenderBars()) {
            this.close();
        } else {
            this.render(true);
    
        }

        Logger.debug("Update done")
    }

    postRender() {
        this.setHudPos();
    }

    setHudPos(bot = 100, left = 0) {
        return new Promise(resolve => {
            let check = (function() {
                let elmnt = this.element[0]
                if (elmnt) {
                    let screenSize = this.getAvaiableScreenSize();
                    let pctWidth = 0.75;
                    let width = screenSize.x * pctWidth;                    
                    elmnt.style.width = width + 'px';

                    elmnt.style.bottom = bot + 'px';
                    elmnt.style.top = null;
                    elmnt.style.left = (screenSize.x - width) / 2 + 'px';
                    elmnt.style.position = 'fixed';

                    elmnt.style.zIndex = 100;
                    Logger.debug("Set bar position!");
                    resolve();
                } else {
                    setTimeout(check, 30);
                }
            }).bind(this);

            check();
        });
    }

    /**
     * Relevant if token linked to bar either changed the value of the bar, which attribute it's linked to,
     * the name, or the module flags
     * Has side effect in case of flags change, enables checkFlagChanges to be used on next update
     * @param {Token} token
     * @param {Object} diff
     * @return {boolean}
     */
    checkRelevantTokenChange(token, diff) {
        // if x or y change, assume token is moving
        if (diff.hasOwnProperty('y') || diff.hasOwnProperty('x'))
            return false;

        if (diff.hasOwnProperty("flags") && diff.flags[Constants.MOD_NAME]) {
            this.checkFlagChanges = true;
            Logger.debug("Flags were changed");
            return true;
        }

        if (token._id === this.barData.token?.id) {
            Logger.debug("Relevant token was changed, checking diffs:", diff);

            // If which attribute is linked to the bar was changed
            if (diff.hasOwnProperty(this.barData.barId)) {
                Logger.debug("Bar attribute was changed");
                return true;
            }
            if (diff.hasOwnProperty("name")) {
                Logger.debug("Name was changed");
                return true;
            }

            // If the value of the attribute linked to the bar was changed
            let barAttribute = this.barData.token?.getBarAttribute(this.barData.barId);

            Logger.debug("Bar attribute:", barAttribute, ", diff has:", diff.hasOwnProperty("actorData"), getProperty(diff.actorData?.data, barAttribute?.attribute));

            if (diff.hasOwnProperty("actorData") && getProperty(diff.actorData?.data, barAttribute?.attribute)) {
                Logger.debug("Bar value was changed");
                return true;
            }
        }

        return false;
    }

    /** @return {boolean} */
    checkRelevantActorChange(actor, diff) {
        let tokenDataInScene = canvas.scene.data.tokens.find(token => token.actorId === actor.id);
        if (!tokenDataInScene)
            return false;

        return this.isRelevantTokenChange(tokenDataInScene, diff)
    }

    /** 
     * Whether the token should have a boss bar linked to it
     * @param {Token} token
     * @return {boolean}
     */
    isBarTokenGood(token = this.barData.token) {
        return token?.scene.isView && TokenBarFlagger.hasTokenBossBar(token);
    }

    shouldRenderBars() {
        return this.barData.token?.scene.isView; //token set and in current scene
    }

    /**
     * Set the token this should display the health of
     * @param token {Token} The token this should display the health of
     */
    setBossToken(token) {
        this.barData.token = token;
        Logger.debug("Set bar token to", token.id);
        this.update();
    }

    set checkFlagChanges(value) {
        this.checkFlagChanges = value;
        Logger.debug("Checking for token bar changes ASAP");
    }

    getAvaiableScreenSize() {
        return {x: window.innerWidth - (ui.sidebar._collapsed ? 0 : ui.sidebar.position.width), y: window.innerHeight}
    }
}