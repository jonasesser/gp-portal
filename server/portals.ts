import * as alt from 'alt-server';
import { PortalSystem } from './system';
import { PORTAL_IPL_CONFIG } from '../shared/enums';
import { GP_PORTAL_CONFIG } from '../shared/config';

export async function createDefaultPortals() {
    // This adds the Maze Bank Tower as default portal
    if (!GP_PORTAL_CONFIG.LOAD_DEFAULT_PORTALS) return;

    await PortalSystem.add({
        name: 'Maze Bank Tower',
        uid: 'portal-maze-bank-tower',
        gates: [
            {
                name: 'ground',
                position: new alt.Vector3({ x: -66.35212707519531, y: -802.2488403320312, z: 44.22731399536133 - 1 }),
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: false,
            },
            {
                name: 'roof',
                position: new alt.Vector3({ x: -75.32481384277344, y: -824.5822143554688, z: 321.2919006347656 - 1 }),
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: false,
            },
        ],
    });

    await PortalSystem.add({
        name: 'Diamond Resorts Casino',
        uid: 'portal-diamond-resorts-casino',
        gates: [
            {
                name: 'entry',
                position: new alt.Vector3({ x: 935.1909790039062, y: 46.17036819458008, z: 80.09584045410156 }),
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: false,
            },
            {
                name: 'exit',
                position: new alt.Vector3({ x: 1089.8856201171875, y: 206.2451629638672, z: -49.5 }),
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: false,
            },
        ],
    });

    await PortalSystem.add({
        name: 'Nightclub',
        uid: 'portal-diamond-resorts-nightclub',
        gates: [
            {
                name: 'entry',
                position: new alt.Vector3({ x: 988.06, y: 80.52, z: 79.97 }),
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: false,
            },
            {
                name: 'exit',
                position: new alt.Vector3({ x: -1569.4, y: -3017.1, z: -75.41 }),
                iplConfig: PORTAL_IPL_CONFIG.NIGHTCLUB,
                triggerOnEnter: true,
                markertype: 0,
                markersize: 0.25,
                entity: 'person',
                inAnotherDimension: true,
            },
        ],
    });
}
