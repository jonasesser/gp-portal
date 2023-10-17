import { PORTAL_IPL_CONFIG } from './enums';

export const GP_PORTAL_CONFIG = {
    //Check portals.ts for default portals
    LOAD_DEFAULT_PORTALS: true,

    // In Athena already some IPLs will loaded by default.
    // Here can you add special IPL configs for your server.
    // These configs can be loaded and deloaded by using a portal gate.
    ENABLE_PORTAL_IPL_CONFIGS: true,

    // Also some IPL Config should be loaded by default without using a gate.
    DEFAULT_IPL_CONFIGS: [PORTAL_IPL_CONFIG.AMMUNATIONS_GUN_STORE],
};
