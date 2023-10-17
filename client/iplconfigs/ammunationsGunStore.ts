import { IPLConfig, IPLLoader } from '../iplloader';
import * as native from 'natives';

let IPL_IDS = [140289, 153857, 168193, 164609, 176385, 175617, 200961, 180481, 178689];

export class ammunationsGunStore implements IPLConfig {
    load(): void {
        for (const key in IPL_IDS) {
            IPLLoader.SetIplProp(IPL_IDS[key], 'GunStoreHooks');
        }

        for (const key in IPL_IDS) {
            native.refreshInterior(IPL_IDS[key]);
        }
    }
    unload(): void {
        for (const key in IPL_IDS) {
            IPLLoader.SetIplProp(IPL_IDS[key], 'GunStoreHooks', false);
        }
    }
}
