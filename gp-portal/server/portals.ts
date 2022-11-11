import * as alt from 'alt-server';
import { PortalSystem } from './system';

export async function createDefaultPortals() {
    // This adds the Maze Bank Tower as default portal
    await PortalSystem.add({
        name: 'Maze Bank Tower',
        uid: 'portal-maze-bank-tower',
        gates: [
            {
                name: 'ground',
                position: new alt.Vector3({ x: -66.35212707519531, y: -802.2488403320312, z: 44.22731399536133 - 1 }),
            },
            {
                name: 'roof',
                position: new alt.Vector3({ x: -75.32481384277344, y: -824.5822143554688, z: 321.2919006347656 - 1 }),
            },
        ],
    });
}
