import { IPLConfig, IPLLoader } from '../iplloader';
import * as native from 'natives';

let IPL_IDS = [137729, 248065];

export class ammunationsGunClub implements IPLConfig {
    load(): void {
        for (const key in IPL_IDS) {
            IPLLoader.SetIplProp(IPL_IDS[key], 'GunClubWallHooks');
        }

        for (const key in IPL_IDS) {
            native.refreshInterior(IPL_IDS[key]);
        }
    }
    unload(): void {
        for (const key in IPL_IDS) {
            IPLLoader.SetIplProp(IPL_IDS[key], 'GunClubWallHooks', false);
        }
    }
}
