import { PortalSystem } from './system';

export async function createDefaultPortals() {
    // This adds the Maze Bank Tower as default portal
    await PortalSystem.add({
        name: 'Maze Bank Tower',
        uid: 'portal-maze-bank-tower',
        gates: [{
            name: 'ground',
            position: { "x": -66.35212707519531, "y": -802.2488403320312, "z": 44.22731399536133 - 0.5 }
        },
        {
            name: 'roof',
            position: { "x": -75.32481384277344, "y": -824.5822143554688, "z": 321.2919006347656 - 0.5 }
        }],
    });
}
