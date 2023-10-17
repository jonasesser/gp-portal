import { IPLConfig, IPLLoader } from '../iplloader';
import * as native from 'natives';
import * as alt from 'alt-client';

let IPL: number = 217617;
let IPLS = [
    'ba_dlc_int_01_ba',
    'ba_int_placement_ba',
    'ba_int_placement_ba_interior_0_dlc_int_01_ba_milo_',
    'ba_int_placement_ba_interior_1_dlc_int_02_ba_milo_',
    'ba_int_placement_ba_interior_2_dlc_int_03_ba_milo_',
    'xs_arena_interior_vip',
    'xs_arena_interior_mod_2',
    'xs_arena_interior_mod',
    'xs_arena_interior',
];
let everyTick: number = null;

export class nightclub implements IPLConfig {
    load(): void {
        alt.logWarning('Loading Nightclub IPL Config');
        IPLLoader.EnableIpls(IPLS);

        // Int01_ba_Style01, Int01_ba_Style02 oder Int01_ba_Style03

        IPLLoader.EnableIpl('ba_barriers_case0');

        //Load Posters
        IPLLoader.EnableIpl('ba_case_0_maddona');

        //Club names
        IPLLoader.SetIplProp(271617, 'Int01_ba_clubname_01', true);

        //Styles:
        IPLLoader.SetIplProp(271617, 'Int01_ba_Style01', true);

        //Podiumstyle
        IPLLoader.SetIplProp(271617, 'Int01_ba_Style01_podium', true);

        //Speakers
        IPLLoader.SetIplProp(271617, 'Int01_ba_equipment_setup', true);
        IPLLoader.SetIplProp(271617, 'Int01_ba_equipment_upgrade', true);

        //Security Update
        IPLLoader.SetIplProp(271617, 'Int01_ba_security_upgrade', true);

        //Turntables
        IPLLoader.SetIplProp(271617, 'Int01_ba_dj04', true);

        //Lights
        IPLLoader.SetIplProp(271617, 'DJ_03_Lights_02', true);

        IPLLoader.SetIplProp(271617, 'Int01_ba_bar_content', true);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy03', true);
        IPLLoader.SetPropColor(271617, 'Int01_ba_trophy03', 1);

        native.requestNamedPtfxAsset('scr_ba_club');
        if (!native.hasNamedPtfxAssetLoaded('scr_ba_club')) native.requestNamedPtfxAsset('scr_ba_club');
        if (native.hasNamedPtfxAssetLoaded('scr_ba_club')) {
            native.useParticleFxAsset('scr_ba_club');
            native.startParticleFxLoopedAtCoord(
                'scr_ba_club_smoke_machine',
                -1602.932,
                -3019.1,
                -79.99,
                0.0,
                -10.0,
                66.0,
                5.0,
                false,
                false,
                false,
                true,
            );
            native.useParticleFxAsset('scr_ba_club');
            native.startParticleFxLoopedAtCoord(
                'scr_ba_club_smoke_machine',
                -1593.238,
                -3017.05,
                -79.99,
                0.0,
                -10.0,
                110.0,
                5.0,
                false,
                false,
                false,
                true,
            );
            native.useParticleFxAsset('scr_ba_club');
            native.startParticleFxLoopedAtCoord(
                'scr_ba_club_smoke_machine',
                -1597.134,
                -3008.2,
                -79.99,
                0.0,
                -10.0,
                -122.53,
                5.0,
                false,
                false,
                false,
                true,
            );
            native.useParticleFxAsset('scr_ba_club');
            native.startParticleFxLoopedAtCoord(
                'scr_ba_club_smoke_machine',
                -1589.966,
                -3008.518,
                -79.99,
                0.0,
                -10.0,
                -166.97,
                5.0,
                false,
                false,
                false,
                true,
            );
        }

        IPLLoader.SetIplProp(271617, 'Int01_ba_dry_ice', true);
        IPLLoader.SetIplProp(271617, 'Int01_ba_Clutter', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_Worklamps', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_deliverytruck', false);
        IPLLoader.SetIplProp(271617, 'light_rigs_off', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_lightgrid_01', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trad_lights', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy04', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy05', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy07', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy08', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy09', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy10', false);
        IPLLoader.SetIplProp(271617, 'Int01_ba_trophy11', false);
        IPLLoader.SetIplProp(217617, 'int01_ba_lights_screen', false);
        IPLLoader.SetIplProp(217617, 'Int02_ba_floor01', false);
        IPLLoader.SetIplProp(217617, 'Int02_ba_floor02', false);
        IPLLoader.SetIplProp(217617, 'Int02_ba_floor03', false);
        IPLLoader.SetIplProp(217617, 'Int02_ba_floor04', false);
        IPLLoader.SetIplProp(217617, 'Int02_ba_floor05', true);

        native.refreshInterior(IPL);

        // let model = alt.hash('ba_prop_club_screens_01');
        // let handle = IPLLoader.CreateNamedRenderTargetForModel('Club_Projector', model);
        // everyTick = alt.everyTick(() => {
        //     if (IPLLoader.drawTv()) {
        //         native.setTvAudioFrontend(false);
        //         native.setTextRenderId(handle);
        //         native.setScriptGfxDrawBehindPausemenu(true);
        //         native.drawTvChannel(0.5, 0.5, 1.0, 1.0, 0.0, 255, 255, 255, 255);
        //         native.setTextRenderId(native.getDefaultScriptRendertargetRenderId());
        //         native.setScriptGfxDrawBehindPausemenu(false);
        //     } else IPLLoader.drawTv();
        // });
        alt.logWarning('Loaded Nightclub IPL Config - finished');
    }
    unload(): void {
        // IPLLoader.EnableIpl(IPLS, false);
        // alt.clearEveryTick(everyTick);
    }
}
