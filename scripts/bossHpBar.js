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
    restoreAnimEnabled = true;
    damageAnimEnabled = true;

    couldRenderLastUpdate = true;
    id = "";
    /** @type {Element} */
    element = null; //set in container postRender()
    prevValue = NaN;
    doOnPostRender = [];

    width = "";

    // set width(val) {
    //     Logger.debug("Set width to " + val);
    //     Logger.debug(new Error().stack)
    //     this._width = val;
    // }
    // get width() {
    //     return this._width;
    // }

    damageWidth = "";
    showName = true;
    noHealth = false;
    noHealthDamage = false;

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
        let skipAnimations = immediate || !this.couldRenderLastUpdate || this.damageWidth === "";

        Logger.debug("Updating bar " + this.id + "...");

        let barAttribute = this.token?.getBarAttribute(this.tokenBarId);
        this.value = barAttribute?.value;
        if (skipAnimations || !this.restoreAnimEnabled)
            this.prevValue = this.value;
        this.max = barAttribute?.max;

        let newWidth = ((this.value || 1) / (this.max || 1) * 100) + "%";
        if (this.value === 0)
            newWidth = "0%"; //was janky with the formula for some reason

        if (!isNaN(this.prevValue) && !isNaN(this.value) && this.prevValue < this.value) { //animate health restore
            this.animateElementWidth(".hp-fill", 150, 2000, newWidth, () => {
                Logger.debug("Restore animation complete!");
                this.width = newWidth;
            });
        } else {
            this.width = newWidth;
            Logger.debug("Set width lower");
        }

        Logger.debug("New width:", this.width, parseFloat(this.width), ", target:", newWidth);
        this.noHealth = parseFloat(this.width) < 0.005;

        if (skipAnimations || !this.damageAnimEnabled) {
            this.damageWidth = this.width;
            Logger.debug("Set dmg upper");
        } else if (this.width !== this.damageWidth) {
            Logger.debug("Compare damage width:", parseFloat(this.width), parseFloat(this.damageWidth))
            if (parseFloat(this.width) < parseFloat(this.damageWidth)) {
                this.animateElementWidth(".damage-fill", 1000, 500, this.width, () => {
                    Logger.debug("Damage animation complete!");
                    this.damageWidth = this.width;
                });
            } else {
                Logger.debug("Set dmg thing");
                this.damageWidth = this.width;
            }
        }

        this.noHealthDamage = parseFloat(this.damageWidth) < 0.005;

        this.name = this.token?.name;
        this.showName = !(!this.name || this.name === "") && this.nameEnabled;

        Logger.debug("After update:", this)

        this.prevValue = this.value;
        this.couldRenderLastUpdate = shouldRender;
    }

    animateElementWidth(className, animDelay, animDur, newWidth, complete) {
        this.doOnPostRender.push(() => {
            Logger.debug("About to animate, class:", className, "delay:", animDelay, "duration:", animDur, "width", newWidth);
            game.bossHpBars.blockUpdates(this.id);

            let startAnimation = function() {
                /**@type {Element} */
                let element = $(this.element).children(".hp-box").children(className)[0];

                let safetyTime = 0; 
                if (element.style.width === "0px") { //bar empty
                    safetyTime = 50; //extra frames waited to make the element display again before starting animation, else it might not work
                    Logger.debug("Animating empty bar");
                }

                Logger.debug("Animating width of", element);

                element.style.display = "block";
                element.style["transition-duration"] =  (animDur - safetyTime) + "ms";
                element.style["transition-property"] = "width";
                console.log(element)
                setTimeout(() => element.style.width = newWidth, safetyTime);
                setTimeout(() => {
                    complete();
                    game.bossHpBars.unblockUpdates(this.id);
                    game.bossHpBars.update();
                }, animDur);
            }.bind(this);

            if (animDelay > 0) {
                setTimeout(startAnimation, animDelay);
            } else {
                startAnimation();
            }
        });
    }

    /**
     * Relevant if token linked to bar either changed the value of the bar, or which attribute it's linked to, or name
     * assumed to be called by the container
     * @param {Token} token
     * @param {Object} diff
     * @return {boolean}
     */
    checkRelevantTokenChange(token, diff) {
        if (token._id === this.getTokenId() || token.id === this.getTokenId()) {
            // Logger.debug("Relevant token was changed, checking diffs:", diff);

            // If which attribute is linked to the bar was changed
            if (diff.hasOwnProperty(this.tokenBarId)) {
                // Logger.debug("Bar attribute was changed");
                return true;
            }
            if (diff.hasOwnProperty("name")) {
                // Logger.debug("Name was changed");
                return true;
            }

            // If the value of the attribute linked to the bar was changed
            let barAttribute = this.token?.getBarAttribute(this.tokenBarId);

            // Logger.debug("Bar attribute:", barAttribute, ", diff has:", diff.hasOwnProperty("actorData"), getProperty(diff.actorData?.data, barAttribute?.attribute));

            if (diff.hasOwnProperty("actorData") && getProperty(diff.actorData?.data, barAttribute?.attribute)
            ||  diff.hasOwnProperty("data")      && getProperty(diff.data, barAttribute?.attribute)) {
                // Logger.debug("Bar value was changed");
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
        return this.token?.id || this.token?._id;
    }

    postRender() {
        this.doOnPostRender.forEach(act => act());
        this.doOnPostRender = [];
    }
}