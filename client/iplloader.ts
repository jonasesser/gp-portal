import { GP_Events_Portal } from '@AthenaPlugins/gp-portal/shared/events';
import * as alt from 'alt-client';
import * as native from 'natives';
import { PORTAL_IPL_CONFIG } from '../shared/enums';
import { ammunationsGunStore } from './iplconfigs/ammunationsGunStore';
import { GP_PORTAL_CONFIG } from '../shared/config';
import { ammunationsGunClub } from './iplconfigs/ammunationsGunClub';
import { nightclub } from './iplconfigs/nightclub';

const configCallbacks = new Map<string, IPLConfig>();

export interface IPLConfig {
    load(): void;
    unload(): void;
}

export class IPLLoader {
    static init() {
        if (GP_PORTAL_CONFIG.ENABLE_PORTAL_IPL_CONFIGS) {
            alt.onServer(GP_Events_Portal.LoadIPL, (name: string, config: string) => {
                if (name) native.requestIpl(name);
                if (config) IPLLoader.loadIPLConfig(config);
            });

            alt.onServer(GP_Events_Portal.UnloadIPL, (name: string, config: string) => {
                if (name) native.removeIpl(name);
                if (config) IPLLoader.unloadIPLConfig(config);
            });

            // Register Config Functions
            configCallbacks.set(PORTAL_IPL_CONFIG.AMMUNATIONS_GUN_STORE, new ammunationsGunStore());
            configCallbacks.set(PORTAL_IPL_CONFIG.AMMUNATIONS_GUN_CLUB, new ammunationsGunClub());
            configCallbacks.set(PORTAL_IPL_CONFIG.NIGHTCLUB, new nightclub());

            // Load Default Configs
            for (const key in GP_PORTAL_CONFIG.DEFAULT_IPL_CONFIGS) {
                const config = GP_PORTAL_CONFIG.DEFAULT_IPL_CONFIGS[key];
                IPLLoader.loadIPLConfig(config);
            }
        }
    }

    static registerConfigFunction(name: string, config: IPLConfig) {
        configCallbacks.set(name, config);
    }

    static loadIPLConfig(config: string) {
        alt.log(`[Portal] Loading IPL Config: ${config}`);
        const callback = configCallbacks.get(config);
        if (callback) {
            alt.log(`[Portal] Loading IPL Config 2: ${config}`);
            callback.load();
        }
    }

    static unloadIPLConfig(config: string) {
        const callback = configCallbacks.get(config);
        if (callback) callback.unload();
    }

    static SetIplProp(interiorId: number, props: string, active: boolean = true) {
        if (active) native.activateInteriorEntitySet(interiorId, props);
        else native.deactivateInteriorEntitySet(interiorId, props);
    }

    static async EnableIpls(ipls: string[], activate: boolean = true) {
        for (const ipl of ipls) {
            IPLLoader.EnableIpl(ipl, activate);            
        }
    }

    static async EnableIpl(ipl: string, activate: boolean = true) {        
        if (activate) {
            alt.logWarning(`[Portal] Loading IPL: ${ipl}`)
            alt.requestIpl(ipl);
        }
        else {
            alt.logWarning(`[Portal] Unloading IPL: ${ipl}`)
            alt.removeIpl(ipl);
        }
    }

    static CreateNamedRenderTargetForModel(name: string, model: number) {
        let handle = 0;
        if (!native.isNamedRendertargetRegistered(name)) native.registerNamedRendertarget(name, false);
        if (!native.isNamedRendertargetLinked(model)) native.linkNamedRendertarget(model);
        if (native.isNamedRendertargetRegistered(name)) handle = native.getNamedRendertargetRenderId(name);
        return handle;
    }

    static drawTv() {
        native.registerScriptWithAudio(0);
        native.setTvChannelPlaylist(2, 'PL_TOU_LED_PALACE', false);
        native.setTvChannel(2);
        native.enableMovieSubtitles(true);
        return true;
    }

    static SetPropColor(id: number, prop: string, style: number) {
        native.setInteriorEntitySetTintIndex(id, prop, style);
        native.refreshInterior(id);
    }
}
