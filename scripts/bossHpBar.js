import { Logger } from "./logger.js"
import { TokenBarFlagger } from "./tokenBarFlagger.js"

export class BossHpBar {
    static lastId = "0";

    /** @type {Token} */
    token = null;
    barId = "bar1";
    value = NaN;
    max = NaN;
    name = "";

    nameEnabled = true;
    id = "";
    shouldDelete = false;

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

        Logger.debug("New bar created", this)

        this.token = token;
        this.update(true);
    }

    /** @param {boolean} immediate */
    update(immediate = false) {
        if (!this.isBarTokenGood) { //if token is no longer valid for bar (eg not in scene), remove
            Logger.debug("Marked bar" + this.id + " for deletion");
            this.shouldDelete = true;
            return;
        }

        Logger.debug("Updating bar " + this.id + "...");

        let barAttribute = this.token?.getBarAttribute(this.barId);
        this.value = barAttribute?.value;
        this.max = barAttribute?.max;
        Logger.debug(this.damageWidth)
        this.width = ((this.value || 1) / (this.max || 1) * 100) + "%";
        Logger.debug(this.damageWidth)

        if (immediate) {
            this.damageWidth = this.width;
        } else if (this.width !== this.damageWidth) {
            if (parseFloat(this.width) < parseFloat(this.damageWidth)) {
                setTimeout(() => {
                    this.damageWidth = this.width;
                    game.bossHpBars.update();
                }, 1000);
            } else {
                this.damageWidth = this.width;
            }
        }

        this.name = this.token?.name;
        this.showName = !(!this.name || this.name === "") && this.nameEnabled;

        Logger.debug("After update:", this)
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
            if (diff.hasOwnProperty(this.barId)) {
                Logger.debug("Bar attribute was changed");
                return true;
            }
            if (diff.hasOwnProperty("name")) {
                Logger.debug("Name was changed");
                return true;
            }

            // If the value of the attribute linked to the bar was changed
            let barAttribute = this.token?.getBarAttribute(this.barId);

            Logger.debug("Bar attribute:", barAttribute, ", diff has:", diff.hasOwnProperty("actorData"), getProperty(diff.actorData?.data, barAttribute?.attribute));

            if (diff.hasOwnProperty("actorData") && getProperty(diff.actorData?.data, barAttribute?.attribute)) {
                Logger.debug("Bar value was changed");
                return true;
            }
        }

        return false;
    }

    /** 
     * Whether the token should have a boss bar linked to it
     * @param {Token} token defaults to this.token
     * @return {boolean}
     */
    isBarTokenGood(token = this.token) {
        return token?.scene.isView && TokenBarFlagger.hasTokenBossBar(token);
    }

    getTokenId() {
        return this.token?.id;
    }
}