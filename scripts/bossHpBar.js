import { Logger } from "./logger.js"
import { TokenBarFlagger } from "./tokenBarFlagger.js"

export class BossHpBar {
    static lastId = "0";

    /** @type {Token} */
    token = null;
    tokenBarId = "bar1";
    value = NaN;
    max = NaN;
    name = "";

    nameEnabled = true;

    couldRenderLastUpdate = true;
    id = "";
    /** @type {Element} */
    element = null; //set in container postRender()

    width = "";
    damageWidth = "";
    showName = true;

    /**
     * Create a new boss bar for the specified token
     * @param {Token} token 
     */
    constructor(token) {
        let newId = (parseInt("0x" + BossHpBar.lastId) + 1).toString(16);
        this.id = newId;
        BossHpBar.lastId = newId;

        this.token = token;
        this.update(true);

        Logger.debug("New bar created", this)
    }

    /** @param {boolean} immediate */
    update(immediate = false) {
        let shouldRender = this.shouldRender();
        if (!shouldRender) {
            this.couldRenderLastUpdate = shouldRender;
            return;
        }

        Logger.debug("Updating bar " + this.id + "...");

        let barAttribute = this.token?.getBarAttribute(this.tokenBarId);
        this.value = barAttribute?.value;
        this.max = barAttribute?.max;
        this.width = ((this.value || 1) / (this.max || 1) * 100) + "%";

        if (immediate || !this.couldRenderLastUpdate || this.damageWidth === "") {
            this.damageWidth = this.width;
        } else if (this.width !== this.damageWidth) {
            if (parseFloat(this.width) < parseFloat(this.damageWidth)) {
                let animDelay = 1000;
                let animDur = 500;

                game.bossHpBars.blockUpdates(this.id);
                setTimeout(() => {
                    /**@type {Element} */
                    let element = $(this.element).children(".hp-box").children(".damage-fill")[0];
                    console.log(element)

                    element.style.transition = "width " + animDur + "ms";
                    element.style.width = this.width;
                    setTimeout(() => {
                        Logger.debug("Damage animation complete!");
                        this.damageWidth = this.width;
                        game.bossHpBars.unblockUpdates(this.id);
                        game.bossHpBars.update();
                    }, animDur);
                }, animDelay);
            } else {
                this.damageWidth = this.width;
            }
        }

        this.name = this.token?.name;
        this.showName = !(!this.name || this.name === "") && this.nameEnabled;

        Logger.debug("After update:", this)

        this.couldRenderLastUpdate = shouldRender;
    }

    /**
     * Relevant if token linked to bar either changed the value of the bar, or which attribute it's linked to, or name
     * assumed to be called by the container
     * @param {Token} token
     * @param {Object} diff
     * @return {boolean}
     */
    checkRelevantTokenChange(token, diff) {
        if (token._id === this.getTokenId()) {
            Logger.debug("Relevant token was changed, checking diffs:", diff);

            // If which attribute is linked to the bar was changed
            if (diff.hasOwnProperty(this.tokenBarId)) {
                Logger.debug("Bar attribute was changed");
                return true;
            }
            if (diff.hasOwnProperty("name")) {
                Logger.debug("Name was changed");
                return true;
            }

            // If the value of the attribute linked to the bar was changed
            let barAttribute = this.token?.getBarAttribute(this.tokenBarId);

            Logger.debug("Bar attribute:", barAttribute, ", diff has:", diff.hasOwnProperty("actorData"), getProperty(diff.actorData?.data, barAttribute?.attribute));

            if (diff.hasOwnProperty("actorData") && getProperty(diff.actorData?.data, barAttribute?.attribute)) {
                Logger.debug("Bar value was changed");
                return true;
            }
        }

        return false;
    }

    /** @return {boolean} */
    shouldRender() {
        return this.token?.scene.isView 
            && TokenBarFlagger.hasTokenBossBar(this.token) 
            && this.token.visible;
    }

    getTokenId() {
        return this.token?.id;
    }
}