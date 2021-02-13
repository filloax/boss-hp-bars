import { BossHpBar } from './bossHpBar.js';
import { Constants } from './constants.js';
import { Logger } from './logger.js';
import { TokenBossBarSettings } from './tokenBossBarSettings.js';

export class BossHpBarsContainer extends Application {
    checkFlagChanges = false;
    /** @type {Array.<BossHpBar>} */
    bars = [];
    viewedBars = [];

    updateBlocks = 0;
    updateBlocksObj = {};

    updateTimeout = null;
    
    constructor() {
        super();
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: 'modules/' + Constants.MOD_NAME + '/templates/container.hbs',
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
        data.bars = this.viewedBars;
        Logger.debug('HUD data:', data);
        return data;
    }

    update() {
        if (this.isBlockingUpdates()) {
            Logger.debug("Updates temporarily blocked, not updating bars")
            if (this.updateTimeout != null) {
                clearTimeout(this.updateTimeout);
            }
            this.updateTimeout = setTimeout(this.update.bind(this), 500);
            return;
        }

        Logger.debug("Updating bars <<<<<<<")

        this.bars.forEach(bar => bar.update())

        //If flags were changed before, check for new valid tokens
        if (this.checkFlagChanges) {
            TokenBossBarSettings.getTokensInSceneWithBar()
                .filter(tk => !this.bars.some(bar => bar.getTokenId() === tk.id))
                .forEach(tk => this.bars.push(new BossHpBar(tk)));
        }

        this.viewedBars = this.bars.filter(bar => bar.shouldRender());

        if (!this.shouldRenderBars()) {
            this.close();
        } else {
            Logger.debug("Rendering...");
            this.render(true);
        }
        this.updateTimeout = null

        Logger.debug("Update done");
    }

    postRender() {
        this.setHudPos();
        this.bars.forEach(bar => {
            bar.element = $('#bosshpbars div[name="' + bar.id + '"]')[0];
            bar.postRender();
        })
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

                    elmnt.style.zIndex = 0;
                    Logger.debug("Set bar container position!");
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
     * @param {boolean} isCreate if the change was called in createToken
     * @return {boolean}
     */
    checkRelevantTokenChange(token, diff, isCreate) {
        // if x or y change, assume token is moving
        if (!isCreate && (diff.hasOwnProperty('y') || diff.hasOwnProperty('x')))
            return false;

        if (diff.hasOwnProperty("flags") && diff.flags[Constants.MOD_NAME]) {
            this.checkFlagChanges = true;
            Logger.debug("Flags were changed");
            return true;
        }
        
        return this.bars.some(bar => {
            let result = bar.checkRelevantTokenChange(token, diff);
            Logger.debug("Check bar:", bar.id, result);
            if (result)
                return true;
        });
    }

    /** @return {boolean} */
    checkRelevantActorChange(actor, diff) {
        let tokenDataInScene = canvas.scene.data.tokens.find(token => token.actorId === actor.id);
        if (!tokenDataInScene)
            return false;

        return this.checkRelevantTokenChange(tokenDataInScene, diff)
    }

    tryDeleteBar(token) {
        if (TokenBossBarSettings.hasTokenBossBar(token)) {
            Logger.debug("Removing token bar for " + token._id);
            this.bars = this.bars.filter(bar => bar.getTokenId() !== token._id);
            this.update();
        }
    }

    shouldRenderBars() {
        return this.viewedBars.length > 0;
    }

    set checkFlagChanges(value) {
        this.checkFlagChanges = value;
        Logger.debug("Checking for new token bar flag changes ASAP");
    }

    getAvaiableScreenSize() {
        return {x: window.innerWidth - (ui.sidebar._collapsed ? 0 : ui.sidebar.position.width), y: window.innerHeight}
    }

    isBlockingUpdates() {
        return this.updateBlocks > 0;
    }

    /** 
     * Block boss health bar updates
     * @param {string} id identifier for the blocking source, in case for instance more bars are animating
     * @return {boolean}
     */
    blockUpdates(id = "default") {
        if (!(id in this.updateBlocksObj)) {
            this.updateBlocks++;
        }
        this.updateBlocksObj[id] = true;
    }

    /** 
     * Re-enable boss health bar updates (if no other blocks are active)
     * @param {string} id identifier for the blocking source, in case for instance more bars are animating
     * @return {boolean}
     */
    unblockUpdates(id = "default") {
        if (id in this.updateBlocksObj) {
            this.updateBlocks--;
            delete this.updateBlocksObj[id];
        }
    }
}