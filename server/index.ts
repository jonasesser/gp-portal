import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { createDefaultPortals } from './portals';
import { PortalSystem } from './system';

const PLUGIN_NAME = 'gpPortal';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    PortalSystem.init();
    await createDefaultPortals();
    alt.log(`~lg~${PLUGIN_NAME} was Loaded`);
});
