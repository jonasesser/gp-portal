import * as alt from 'alt-server';
import { PluginSystem } from '../../server/systems/plugins';
import { createDefaultPortals } from './portals';
import { PortalSystem } from './system';

const PLUGIN_NAME = 'gpPortal';

PluginSystem.registerPlugin(PLUGIN_NAME, async () => {
    PortalSystem.init();
    await createDefaultPortals();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
